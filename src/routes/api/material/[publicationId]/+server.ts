import {
	getMaterialByPublicationId, updateMaterialByPublicationId, prisma, handleConnections
} from "$lib/database";
import {addFile, deleteFile, editFile} from "$lib/database/file";

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
		return new Response(JSON.stringify(material), { status: 200 });
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
		return new Response(JSON.stringify({ error: 'Bad Request - Invalid ID' }), {
			status: 400,
		});
	}

	try {
		const material = await prisma.$transaction(async (prismaTransaction) => {
			await handleConnections(request, publicationId, prismaTransaction);

			const body = await request.json();

			// add files
			for (const file of body.files.add) {
				await addFile(file.title, file.info, body.materialId, prismaTransaction);
			}

			// delete files
			for (const file of body.files.delete) {
				await deleteFile(file.path, prismaTransaction);
			}

			// edit existing files
			for (const file of body.files.edit) {
				await editFile(file.path, file.title, file.info, prismaTransaction);
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

			return material;
		});

		return new Response(JSON.stringify({ material }), { status: 200 });
	} catch (error) {
		return new Response(JSON.stringify({ error: 'Server Error' }), {
			status: 500,
		});
	}
}
