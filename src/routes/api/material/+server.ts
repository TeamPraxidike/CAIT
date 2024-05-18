import {
	getAllMaterials,
	createMaterialPublication,
	prisma,
	type FileDiffActions,
	addFile,
	type MaterialForm,
} from '$lib/database';
import type { RequestHandler } from '@sveltejs/kit';
import { Difficulty } from '@prisma/client';

/**
 * Convert a difficulty string to difficulty enum
 */
function mapToDifficulty(difficulty: string): Difficulty {
	switch (difficulty.toLowerCase()) {
		case 'easy':
			return Difficulty.easy;
		case 'medium':
			return Difficulty.medium;
		case 'hard':
			return Difficulty.hard;
		default:
			throw new Error(`Invalid difficulty: ${difficulty}`);
	}
}

/**
 * Get all materials
 */
export const GET: RequestHandler = async ({ url }) => {
	// Authentication step
	// return 401 if user not authenticated

	try {
		const t = url.searchParams.get('tags');
		const tags = t ? t.split(',') : [];
		const d = url.searchParams.get('difficulty');
		const diff = d ? d.split(',').map(mapToDifficulty) : [];
		const p = url.searchParams.get('publishers');
		const publishers = p ? p.split(',').map((x) => parseInt(x)) : [];
		const ty = url.searchParams.get('types');
		const type = ty ? ty.split(',') : [];
		const materials = await getAllMaterials(tags, publishers, diff, type);
		return new Response(JSON.stringify(materials), { status: 200 });
	} catch (error) {
		return new Response(JSON.stringify({ error: 'Server Error' }), {
			status: 500,
		});
	}
};

/**
 * Create a publication of type material
 * @param request
 * @param params
 */
export async function POST({ request }) {
	// Authentication step
	// return 401 if user not authenticated

	const body: MaterialForm = await request.json();
	const metaData = body.metaData;
	const userId = body.userId;
	const fileInfo: FileDiffActions = body.fileDiff;

	try {
		const createdMaterial = await prisma.$transaction(
			async (prismaTransaction) => {
				const material = await createMaterialPublication(
					userId,
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

				//await handleConnections(request, material.publicationId, prismaTransaction);

				// add files
				for (const file of fileInfo.add) {
					const buffer: Buffer = Buffer.from(file.info, 'base64');

					await addFile(
						file.title,
						file.type,
						buffer,
						material.id,
						prismaTransaction,
					);
				}

				return material;
			},
		);

		const id = createdMaterial.id;

		return new Response(JSON.stringify({ id }), { status: 200 });
	} catch (error) {
		console.log(error);
		return new Response(JSON.stringify({ error: 'Server Error' }), {
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
