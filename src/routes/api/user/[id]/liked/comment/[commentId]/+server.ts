import { getComment, getUserById, likesCommentUpdate } from '$lib/database';

/**
 * Likes a comment
 * @param params
 */
export async function POST({ params }) {
	const { id, commentId } = params;
	const user = await getUserById(parseInt(id));
	if (!user)
		return new Response(JSON.stringify({ error: 'User not found' }), {
			status: 404,
		});

	const comment = await getComment(parseInt(commentId));
	if (!comment)
		return new Response(JSON.stringify({ error: 'Comment not found' }), {
			status: 404,
		});

	try {
		const response = await likesCommentUpdate(
			parseInt(id),
			parseInt(commentId),
		);
		return new Response(JSON.stringify({ message: response }), {
			status: 200,
		});
	} catch (error) {
		return new Response(JSON.stringify({ error }), { status: 500 });
	}
}
