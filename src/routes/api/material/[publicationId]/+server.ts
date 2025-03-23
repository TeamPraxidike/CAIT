import {
	coverPicFetcher,
	deleteMaterialByPublicationId,
	type FetchedFileArray,
	type FetchedFileItem,
	type FileDiffActions,
	fileSystem,
	getMaterialByPublicationId, getPublisherId,
	handleConnections,
	type MaterialForm,
	prisma,
	updateCoverPic,
	updateFiles,
	updateMaterialByPublicationId
} from '$lib/database';

import { type File as PrismaFile, Prisma, type PrismaClient } from '@prisma/client';
import { canEditOrRemove, unauthResponse, verifyAuth } from '$lib/database/auth';


import {enqueueMaterialComparison} from "$lib/PiscinaUtils/runner";
import { getMaintainers, getPublisher } from '$lib/database/publication';


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
			const currentFileData = await fileSystem.readFile(file.path);
			fileData.push({
				fileId: file.path,
				data: currentFileData.toString('base64'),
			});
		}

		// coverPic return
		const coverFileData: FetchedFileItem = await coverPicFetcher(
			material.encapsulatingType,
			material.publication.coverPic,
		);

		// TODO: is the || necessary
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
	const body: MaterialForm & {
		materialId: number;
		publisherId: string
	} = await request.json();
	
	const authError = await verifyAuth(locals, body.userId);
	if (authError) return authError;

	// TODO: cleanup
	const material = body;
	const metaData = material.metaData;
	const publisherId = material.publisherId;
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
		// TODO: should we trust frontend for this info? Probably not...
		const maintainerIds = (await getMaintainers(publicationId))?.maintainers?.map(m => m.id) || [];
		const publisher = await getPublisher(publicationId);
		const publisherId = publisher?.publisher?.id;

		if (!(await canEditOrRemove(locals, publisherId, maintainerIds, "EDIT")))
			return unauthResponse();

		const updatedMaterial = await prisma.$transaction(
			async (prismaTransaction: PrismaClient) => {
				await handleConnections(
					tags,
					maintainers,
					publicationId,
					prismaTransaction,
				);

				await updateCoverPic(
					coverPic,
					publicationId,
					body.userId,
					prismaTransaction,
				);

				await updateFiles(
					fileInfo,
					body.materialId,
					body.userId,
					prismaTransaction,
				);

				return await updateMaterialByPublicationId(
					publicationId,
					metaData,
					prismaTransaction,
				);
			},
		);

		const materialId = updatedMaterial.id;

		enqueueMaterialComparison(publicationId, materialId).catch(error => console.error(error))


		return new Response(JSON.stringify({ id: materialId }), { status: 200 });
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

export async function DELETE({ params, locals }) {
	const publicationId = parseInt(params.publicationId);

	const publication = await getPublisherId(publicationId);
	const authError = await verifyAuth(locals, publication.publisherId);
	if (authError) return authError;

	if (isNaN(publicationId) || publicationId <= 0) {
		return new Response(
			JSON.stringify({
				error: 'Bad Delete Request - Invalid Material publication Id',
			}),
			{ status: 400 },
		);
	}

	try {
		// TODO: should we trust frontend for this info? Probably not...
		const maintainerIds = (await getMaintainers(publicationId))?.maintainers?.map(m => m.id) || [];
		const publisher = await getPublisher(publicationId);
		const publisherId = publisher?.publisher?.id;

		if (!(await canEditOrRemove(locals, publisherId, maintainerIds, "REMOVE")))
			return unauthResponse();

		const material = await prisma.$transaction(
			async (prismaTransaction: PrismaClient) => {
				const publication = await deleteMaterialByPublicationId(
					publicationId,
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
