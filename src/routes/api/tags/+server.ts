import type { RequestHandler } from '@sveltejs/kit';
import { addTag, getAllTags, getTagByContent } from '$lib/database/tag';
import { prisma } from '$lib/database';

export const GET: RequestHandler = async () => {
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

export const POST: RequestHandler = async ({ request }) => {
	try {
		const addTagTransaction = await prisma.$transaction(
			async (prismaTransaction) => {
				const body = await request.json();
				const tagDB = await getTagByContent(body.content);
				console.log(tagDB);
				if (tagDB) {
					return new Response('Tag already exists', { status: 403 });
				}

				const tag = await addTag(body.content, prismaTransaction);

				if (!tag) {
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
		const id = addTagTransaction.id;

		return new Response(JSON.stringify({ id }), { status: 200 });
	} catch (error) {
		console.log(error);
		return new Response(JSON.stringify({ error: 'Server Error' }), {
			status: 500,
			//		body: error?.message || ""
		});
	}
};
