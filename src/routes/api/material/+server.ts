import { getAllMaterials, createMaterialPublication } from '$lib/database';
import type { RequestHandler } from '@sveltejs/kit';

/**
 * Get all materials
 */
export const GET: RequestHandler = async () => {
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
		return new Response(JSON.stringify({ error: 'Server Error' }), {
			status: 500,
		});
	}
};
