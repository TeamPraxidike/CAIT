import { getAllMaterials, createMaterialPublication } from '$lib/database';
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
		console.log('Here');
		const t = url.searchParams.get('tags');
		const tags = t ? t.split(',') : [];
		console.log(tags);
		const d = url.searchParams.get('difficulty');
		const diff = d ? d.split(',').map(mapToDifficulty) : [];

		console.log(diff);
		const p = url.searchParams.get('publishers');
		const publishers = p ? p.split(',').map((x) => parseInt(x)) : [];
		console.log(publishers);
		const ty = url.searchParams.get('types');
		const type = ty ? ty.split(',') : [];
		console.log(type);

		const materials = await getAllMaterials(tags, publishers, diff, type);
		console.log('DB return');
		console.log(materials);
		return new Response(JSON.stringify(materials), { status: 200 });
	} catch (error) {
		console.log('There was an Error');
		return new Response(JSON.stringify({ error: 'Server Error' }), {
			status: 500,
		});
	}
};

/**
 * Create a new material publication. Adds the files to the database.
 * @param request
 */
export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();

	// Authentication step
	// return 401 if user not authenticated

	try {
		// prisma will automatically complain if the user does not exist so no need to check
		const material = await createMaterialPublication({
			userId: body.userId,
			title: body.title,
			description: body.description,
			copyright: body.copyright,
			difficulty: body.difficulty,
			timeEstimate: body.timeEstimate,
			theoryPractice: body.theoryPractice,
			paths: body.paths,
			titles: body.titles,
		});
		return new Response(JSON.stringify({ material }), { status: 200 });
	} catch (error) {
		return new Response(JSON.stringify({ error: `Server Error ${error}` }), {
			status: 500,
		});
	}
};
