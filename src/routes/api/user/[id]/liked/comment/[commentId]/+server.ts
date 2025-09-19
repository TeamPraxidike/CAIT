import {
	getComment,
	getUserById,
	likesCommentUpdate,
	updateReputation,
} from '$lib/database';
import { verifyAuth } from '$lib/database/auth';

/**
 * Likes a comment
 * @param params
 * @param locals
 */
export async function POST({ params, locals }) {
	const { id, commentId } = params;

	const authError = await verifyAuth(locals, id);
	if (authError) return authError;

	const user = await getUserById(id);
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
		const response = await likesCommentUpdate(id, parseInt(commentId));
		if (id !== comment.userId) {
			if (response === 'Comment liked successfully') {
				await updateReputation(comment.userId, 9);
			} else if (response === 'Comment unliked successfully') {
				await updateReputation(comment.userId, -9);
			}
		}
		return new Response(JSON.stringify({ message: response }), {
			status: 200,
		});
	} catch (error) {
		return new Response(JSON.stringify({ error }), { status: 500 });
	}
}
