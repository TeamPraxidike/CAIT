import {
	coverPicFetcher,
	deleteFile,
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
import {type File as PrismaFile, Prisma} from "@prisma/client"

export async function GET({ params }) {
	// Authentication step
	// return 401 if user not authenticated

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

		return new Response(
			JSON.stringify({ material, fileData, coverFileData }),
			{
				status: 200,
			},
		);
	} catch (error) {
		return new Response(JSON.stringify({ error: 'Server Error' }), {
			status: 500,
		});
	}
}

/**
 * Update material
 * @param request
 * @param params
 */
export async function PUT({ request, params }) {
	// Authentication step
	// return 401 if user not authenticated
	// Add 400 Bad Request check

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

		return new Response(JSON.stringify({ id }), { status: 200 });
	} catch (error) {
		console.error(error);
		// TODO: documentation on this is atrocious, verify with tests!!!
		if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025'){
			return new Response(JSON.stringify({ error: 'Material not found' }), {
				status: 404,
			});
		}
		return new Response(JSON.stringify({ error: 'Server Error' }), {
			status: 500,
		});
	}
}

export async function DELETE({ params }) {
	const id = parseInt(params.publicationId);

	if (isNaN(id) || id <= 0) {
		return new Response(
			JSON.stringify({
				error: 'Bad Delete Request - Invalid Material Id',
			}),
			{ status: 400 },
		);
	}
	try {
		const material = await prisma.$transaction(async (prismaTransaction) => {
			const publication =
				await deleteMaterialByPublicationId(
					id,
					prismaTransaction,
				);

			const coverPic: PrismaFile = publication.coverPic;

			// if there is a coverPic, delete
			if (coverPic) {
				fileSystem.deleteFile(coverPic.path);
			}

			// delete all files
			for (const file of publication.material!.files) {
				fileSystem.deleteFile(file.path);
			}

			return publication.material;
		});

		return new Response(JSON.stringify(material), { status: 200 });
	} catch (error) {
		// TODO: documentation on this is atrocious, verify with tests!!!
		if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025'){
			return new Response(JSON.stringify({ error: 'Material not found' }), {
				status: 404,
			});
		}
		return new Response(JSON.stringify({ error: 'Server Error' }), {
			status: 500,
		});
	}
}
