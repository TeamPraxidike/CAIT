import {
	coverPicFetcher,
	deleteMaterialByPublicationId,
	type FetchedFileArray,
	type FetchedFileItem,
	type FileDiffActions,
	fileSystem,
	getMaterialByPublicationId,
	handleConnections,
	type MaterialForm,
	prisma,
	updateCoverPic,
	updateFiles,
	updateMaterialByPublicationId,
} from '$lib/database';
import { type File as PrismaFile, Prisma } from '@prisma/client';
import { canEdit, unauthResponse, verifyAuth } from '$lib/database/auth';

import {enqueueMaterialComparison} from "$lib/PiscinaUtils/runner";


export async function GET({ params, locals }) {
	const authError = await verifyAuth(locals);
	if (authError) return authError;

	const publicationId = parseInt(params.publicationId);

	if (isNaN(publicationId) || publicationId <= 0) {
		return new Response(
			JSON.stringify({ error: 'Bad Request - Invalid ID' }),
			{
				status: 400,
			},
		);
	}

	try {
		const material = await getMaterialByPublicationId(publicationId);
		if (!material) {
			return new Response(
				JSON.stringify({ error: 'Material Not Found' }),
				{
					status: 404,
				},
			);
		}

		// file content for return
		const fileData: FetchedFileArray = [];

		for (const file of material.files) {
			const currentFileData = fileSystem.readFile(file.path);
			fileData.push({
				fileId: file.path,
				data: currentFileData.toString('base64'),
			});
		}

		// coverPic return
		const coverFileData: FetchedFileItem = coverPicFetcher(
			material.encapsulatingType,
			material.publication.coverPic,
		);

		material.publication.publisher = {
			...material.publication.publisher,
			profilePicData:
				material.publication.publisher.profilePic?.data || '',
		};

		return new Response(
			JSON.stringify({ material, fileData, coverFileData }),
			{
				status: 200,
			},
		);
	} catch (error) {
		console.error(error);
		return new Response(JSON.stringify({ error: 'Server Error' }), {
			status: 500,
		});
	}
}

export async function PUT({ request, params, locals }) {
	const authError = await verifyAuth(locals);
	if (authError) return authError;

	const body: MaterialForm & {
		materialId: number;
	} = await request.json();

	const material: MaterialForm = body;
	const metaData = material.metaData;
	// const userId = material.userId;
	const fileInfo: FileDiffActions = material.fileDiff;
	const tags = metaData.tags;
	const maintainers = metaData.maintainers;
	const coverPic = material.coverPic;

	const publicationId = parseInt(params.publicationId);

	if (isNaN(publicationId) || publicationId <= 0) {
		return new Response(
			JSON.stringify({ error: 'Bad Request - Invalid ID' }),
			{
				status: 400,
			},
		);
	}

	try {
		const material = await getMaterialByPublicationId(publicationId);
		if (!(await canEdit(locals, material.publication.publisher.id)))
			return unauthResponse();

		const updatedMaterial = await prisma.$transaction(
			async (prismaTransaction) => {
				await handleConnections(
					tags,
					maintainers,
					publicationId,
					prismaTransaction,
				);

				await updateCoverPic(
					coverPic,
					publicationId,
					prismaTransaction,
				);

				await updateFiles(fileInfo, body.materialId, prismaTransaction);

				return await updateMaterialByPublicationId(
					publicationId,
					metaData,
					prismaTransaction,
				);
			},
		);

		const id = updatedMaterial.id;

		enqueueMaterialComparison(publicationId).catch(error => console.error(error))

		return new Response(JSON.stringify({ id }), { status: 200 });
	} catch (error) {
		console.error(error);
		if (
			error instanceof Prisma.PrismaClientKnownRequestError &&
			error.code === 'P2025'
		) {
			return new Response(
				JSON.stringify({ error: 'Material not found' }),
				{
					status: 404,
				},
			);
		}
		return new Response(JSON.stringify({ error: 'Server Error' }), {
			status: 500,
		});
	}
}

export async function DELETE({ params }) {
	const id = parseInt(params.publicationId);

	console.log(id);

	if (isNaN(id) || id <= 0) {
		return new Response(
			JSON.stringify({
				error: 'Bad Delete Request - Invalid Material Id',
			}),
			{ status: 400 },
		);
	}
	try {
		const material = await prisma.$transaction(
			async (prismaTransaction) => {
				const publication = await deleteMaterialByPublicationId(
					id,
					prismaTransaction,
				);

				const coverPic: PrismaFile = publication.coverPic;

				// if there is a coverPic, delete
				if (coverPic) {
					fileSystem.deleteFile(coverPic.path);
				}

				// delete all files
				for (const file of publication.materials!.files) {
					fileSystem.deleteFile(file.path);
				}

				return publication.materials;
			},
		);

		return new Response(JSON.stringify(material), { status: 200 });
	} catch (error) {
		console.error(error);
		if (
			error instanceof Prisma.PrismaClientKnownRequestError &&
			error.code === 'P2025'
		) {
			return new Response(
				JSON.stringify({ error: 'Material not found' }),
				{
					status: 404,
				},
			);
		}
		return new Response(JSON.stringify({ error: 'Server Error' }), {
			status: 500,
		});
	}
}
