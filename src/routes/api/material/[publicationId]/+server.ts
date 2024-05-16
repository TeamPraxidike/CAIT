import {
	getMaterialByPublicationId, updateMaterialByPublicationId, prisma, handleConnections,
	type FileInfo, convertBlobToNodeBlob, fileSystem
} from "$lib/database";
import {addFile, deleteFile, editFile} from "$lib/database/file";
import {Blob as NodeBlob} from "node:buffer";

/**
 * Get material by id
 * @param params
 * @constructor
 */


export async function GET({ params }) {
	// Authentication step
	// return 401 if user not authenticated

	const publicationId = parseInt(params.publicationId);

	if (isNaN(publicationId) || publicationId <= 0) {
		return new Response(JSON.stringify({ error: 'Bad Request - Invalid ID' }), {
			status: 400,
		});
	}

	try {
		const material = await getMaterialByPublicationId(publicationId);
		if (!material) {
			return new Response(JSON.stringify({ error: 'Material Not Found' }), {
				status: 404,
			});
		}

		// file content for return
		const fileData: {fileId: string, data: Buffer}[] = [];
		for (const file of material.files) {
			const currentFileData = fileSystem.readFile(file.path);
			fileData.push({fileId: file.path, data: currentFileData});
		}

		return new Response(JSON.stringify({material, fileData}), { status: 200 });
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

	const publicationId = parseInt(params.publicationId);

	if (isNaN(publicationId) || publicationId <= 0) {
		return new Response(JSON.stringify({error: 'Bad Request - Invalid ID'}), {
			status: 400,
		});
	}

	try {
		const material = await prisma.$transaction(async (prismaTransaction) => {
			await handleConnections(request, publicationId, prismaTransaction);

			const body = await request.json();

			const fileInfo: FileInfo = body.FileInfo

			// save file content for return
			const fileData: { fileId: string, data: Buffer }[] = [];

			// add files
			for (const file of fileInfo.add) {
				const {buffer, info} = await convertBlobToNodeBlob(file.info);
				const createdFile = await addFile(file.title, info, body.materialId, prismaTransaction);
				fileData.push({fileId: createdFile.path, data: buffer});
			}

			// delete files
			for (const file of fileInfo.delete) {
				await deleteFile(file.path, prismaTransaction);
			}

			// edit existing files
			for (const file of fileInfo.edit) {
				const {buffer, info} = await convertBlobToNodeBlob(file.info);
				await editFile(file.path, file.title, info, prismaTransaction);
				fileData.push({fileId: file.path, data: buffer});
			}

			const material = await updateMaterialByPublicationId(
				publicationId, body.title, body.description, body.difficulty,
				body.learningObjectives, body.prerequisites, body.coverPic, body.copyright,
				body.timeEstimate, body.theoryPractice, prismaTransaction
			);
			if (!material) {
				return new Response(JSON.stringify({error: 'Material Not Found'}), {
					status: 404,
				});
			}

			return {material, fileData};
		});

		return new Response(JSON.stringify({material}), {status: 200});
	} catch (error) {
		return new Response(JSON.stringify({error: 'Server Error'}), {
			status: 500,
		});
	}
}

export async function DELETE({ params }) {
	const id = parseInt(params.publicationId);

	if (isNaN(id) || id <= 0) {
		return new Response(
			JSON.stringify({ error: 'Bad Delete Request - Invalid Material Id' }),
			{ status: 400 },
		);
	}
	try {
		const material = await getMaterialByPublicationId(id);
		if (!material) {
			return new Response(JSON.stringify({ error: 'Material Not Found' }), {
				status: 404,
			});
		}
		await deleteMaterialByPublicationId(id);
		return new Response(JSON.stringify(material), { status: 200 });
	} catch (error) {
		return new Response(JSON.stringify({ error: 'Server Error' }), {
			status: 500,
		});
	}
}