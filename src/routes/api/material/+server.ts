import {
	getAllMaterials, createMaterialPublication, prisma,
	type FileInfo, handleConnections, convertBlobToNodeBlob, type FetchedFileArray, getMaterialByPublicationId,
	addFile, bufToBase64
} from '$lib/database';

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
			const body = await request.json();

			const fileInfo: FileInfo = body.FileInfo

			const material = await createMaterialPublication(
				body.title, body.description, body.difficulty,
				body.learningObjectives, body.prerequisites, body.coverPic, body.copyright,
				body.timeEstimate, body.theoryPractice, prismaTransaction
			);
			if (!material) {
				return null;
			}

			await handleConnections(request, material.publicationId, prismaTransaction);

			const fileData: FetchedFileArray = [];

			// add files
			for (const file of fileInfo.add) {
				const {buffer, info} = await convertBlobToNodeBlob(file.info);
				const createdFile = await addFile(file.title, info, material.id, prismaTransaction);
				fileData.push({fileId: createdFile.path, data: buffer});
			}

			return {material, fileData};
		});

		// check if material is null
		if (!createdMaterial) {
			return new Response(JSON.stringify({error: 'Bad Request'}), {
				status: 400,
			});
		}

		// get material including updated relations
		const actualMaterial = await getMaterialByPublicationId(createdMaterial.material.publicationId);

		// If JSON stringify cannot handle raw Buffer, use this:
		// const transformedFileData = await bufToBase64(createdMaterial.fileData);

		const fileData = createdMaterial.fileData;

		return new Response(JSON.stringify({actualMaterial, fileData}), {status: 200});
	} catch (error) {
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
