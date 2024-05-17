import { createComment, type createCommentData } from '$lib/database';

export async function POST({ request }) {
	try {
		const body = await request.json();
		const commentData: createCommentData = {
			userId: body.userId,
			publicationId: body.publicationId,
			content: body.content,
		};

		const comment = await createComment(commentData);
		if (!comment)
			return new Response(
				JSON.stringify({ error: 'Publication or user not found' }),
				{
					status: 404,
				},
			);
		return new Response(JSON.stringify(comment), { status: 200 });
	} catch (error) {
		return new Response(JSON.stringify({ error }), { status: 500 });
	}
}
