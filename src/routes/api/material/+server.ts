import {
	getAllMaterials, createMaterialPublication, prisma,
	type FileInfo, handleConnections, type FetchedFileArray, getMaterialByPublicationId,
	addFile, bufToBase64, type MaterialForm
} from '$lib/database';

import {Blob as NodeBlob} from "node:buffer"

/**
 * Get all materials
 */
export async function GET() {
	// Authentication step
	// return 401 if user not authenticated

	try {
		const materials = await getAllMaterials();
		return new Response(JSON.stringify(materials), { status: 200 });
	} catch (error) {
		return new Response(JSON.stringify({ error: 'Server Error' }), {
			status: 500,
		});
	}
}

/**
 * Create a publication of type material
 * @param request
 * @param params
 */
export async function POST({ request }) {
	// Authentication step
	// return 401 if user not authenticated
	try {
		const createdMaterial = await prisma.$transaction(async (prismaTransaction) => {
			const body:MaterialForm = await request.json();
			const fileInfo: FileInfo = body.fileInfo

			const material = await createMaterialPublication(
				body.userId, body.title, body.description, body.difficulty,
				body.learningObjectives, body.prerequisites, body.coverPic, body.copyright,
				body.timeEstimate, body.theoryPractice, prismaTransaction
			);

			if (!material) {
				return new Response(JSON.stringify({error: 'Bad Request'}), {
					status: 400,
				});
			}

			// await handleConnections(request, material.publicationId, prismaTransaction);

			// add files
			for (const file of fileInfo.add) {
				const buffer:Buffer = Buffer.from(file.info, 'base64');
				// const info: NodeBlob = new NodeBlob([buffer]);

				await addFile(file.title, file.type, buffer, material.id, prismaTransaction);
			}

			return material;
		});

		const id = createdMaterial.id;

		return new Response(JSON.stringify({id}), {status: 200});
	} catch (error) {
		console.log(error);
		return new Response(JSON.stringify({error: 'Server Error'}), {
			status: 500,
		});
	}
}

// /**
//  * Create a new material publication. Adds the files to the database.
//  * @param request
//  */
// export async function POST({ request }) {
// 	const body = await request.json();
//
// 	// Authentication step
// 	// return 401 if user not authenticated
//
// 	try {
// 		// prisma will automatically complain if the user does not exist so no need to check
// 		const material = await createMaterialPublication({
// 			userId: body.userId,
// 			title: body.title,
// 			description: body.description,
// 			copyright: body.copyright,
// 			difficulty: body.difficulty,
// 			timeEstimate: body.timeEstimate,
// 			theoryPractice: body.theoryPractice,
// 			paths: body.paths,
// 			titles: body.titles,
// 		});
// 		return new Response(JSON.stringify({ material }), { status: 200 });
// 	} catch (error) {
// 		return new Response(JSON.stringify({ error: `Server Error ${error}` }), {
// 			status: 500,
// 		});
// 	}
// }
