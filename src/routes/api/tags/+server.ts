import type { RequestHandler } from '@sveltejs/kit';
import { addTag, getAllTags, getTagByContent } from '$lib/database/tag';
import { prisma } from '$lib/database';
import { verifyAuth } from '$lib/database/auth';

export const GET: RequestHandler = async ({ locals }) => {
	const authError = await verifyAuth(locals);
	if (authError) return authError;

	try {
		const tags = await getAllTags();
		return new Response(JSON.stringify(tags), { status: 200 });
	} catch (error) {
		console.log('There was an Error');
		return new Response(JSON.stringify({ error: 'Server Error' }), {
			status: 500,
		});
	}
};

export const POST: RequestHandler = async ({ request, locals }) => {
	const authError = await verifyAuth(locals);
	if (authError) return authError;

	try {
		let failed = false;
		const addTagTransaction = await prisma.$transaction(
			async (prismaTransaction) => {
				const body = await request.json();
				const tagDB = await getTagByContent(body.content);
				console.log(tagDB);
				if (tagDB) {
					failed = true;
					return new Response('Tag already exists', { status: 403 });
				}

				const tag = await addTag(body.content, prismaTransaction);

				if (!tag) {
					failed = true;
					return new Response(
						JSON.stringify({ error: 'Bad Request' }),
						{
							status: 400,
						},
					);
				}

				return tag;
			},
		);
		console.log(failed);
		if (failed) return addTagTransaction;
		const id = addTagTransaction.id;

		return new Response(JSON.stringify({ id }), { status: 200 });
	} catch (error) {
		console.log(error);
		return new Response(JSON.stringify({ error: 'Server Error' }), {
			status: 500,
		});
	}
};
