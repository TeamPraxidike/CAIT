import {
	getMaterialByPublicationId,
	updateMaterialByPublicationId,
	prisma,
	handleConnections,
	type FileDiffActions,
	fileSystem,
	deleteMaterialByPublicationId,
	type FetchedFileArray,
	addFile,
	deleteFile,
	editFile,
	type MaterialForm,
} from '$lib/database';

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

		// If JSON stringify cannot handle raw Buffer, use this:
		//const transformedFileData = await bufToBase64(fileData);

		return new Response(JSON.stringify({ material, fileData }), {
			status: 200,
		});
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

	const body: {
		material: MaterialForm;
		materialId: number;
	} = await request.json();
	const material: MaterialForm = body.material;
	const metaData = material.metaData;
	// const userId = material.userId;
	const fileInfo: FileDiffActions = material.fileDiff;

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
					request,
					publicationId,
					prismaTransaction,
				);

				// add files
				for (const file of fileInfo.add) {
					const buffer: Buffer = Buffer.from(file.info, 'base64');

					await addFile(
						file.title,
						file.type,
						buffer,
						body.materialId,
						prismaTransaction,
					);
				}

				// delete files
				for (const file of fileInfo.delete) {
					await deleteFile(file.path, prismaTransaction);
				}

				// edit existing files
				for (const file of fileInfo.edit) {
					const buffer: Buffer = Buffer.from(file.info, 'base64');

					await editFile(
						file.path,
						file.title,
						buffer,
						prismaTransaction,
					);
				}

				const material = await updateMaterialByPublicationId(
					publicationId,
					metaData,
					prismaTransaction,
				);
				if (!material) {
					return new Response(
						JSON.stringify({ error: 'Bad Request' }),
						{
							status: 400,
						},
					);
				}

				return material;
			},
		);

		const id = updatedMaterial.id;

		return new Response(JSON.stringify({ id }), { status: 200 });
	} catch (error) {
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
		const material = await getMaterialByPublicationId(id);
		if (!material) {
			return new Response(
				JSON.stringify({ error: 'Material Not Found' }),
				{
					status: 404,
				},
			);
		}
		await deleteMaterialByPublicationId(id);
		return new Response(JSON.stringify(material), { status: 200 });
	} catch (error) {
		return new Response(JSON.stringify({ error: 'Server Error' }), {
			status: 500,
		});
	}
}
