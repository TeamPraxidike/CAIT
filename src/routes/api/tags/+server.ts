import type { RequestHandler } from '@sveltejs/kit';
import { addTags, getAllTags, prisma } from '$lib/database';
import { verifyAuth } from '$lib/database/auth';

export const GET: RequestHandler = async ({ locals }) => {
	const authError = await verifyAuth(locals);
	if (authError) return authError;

	try {
		const tags = await getAllTags();
		return new Response(JSON.stringify(tags), { status: 200 });
	} catch (error) {
		return new Response(JSON.stringify({ error: 'Server Error' }), {
			status: 500,
		});
	}
};

export const POST: RequestHandler = async ({ request, locals }) => {
	const authError = await verifyAuth(locals);
	if (authError) return authError;

	try {
		const body = await request.json();
		const { tags } = body;
		if (!Array.isArray(tags)) {
			return new Response(
				JSON.stringify({
					error: 'Tags should be an array of strings.',
				}),
				{ status: 400 },
			);
		}

		const addTagsTransaction = await prisma.$transaction(
			async (prismaTransaction) => {
				return await addTags(tags, prismaTransaction);
			},
		);

		return new Response(JSON.stringify(addTagsTransaction), {
			status: 200,
		});
	} catch (error) {
		console.log(error);
		return new Response(JSON.stringify({ error: 'Server Error' }), {
			status: 500,
		});
	}
};
