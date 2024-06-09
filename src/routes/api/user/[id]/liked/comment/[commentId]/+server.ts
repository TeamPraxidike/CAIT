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
 */
export async function POST({ params, locals }) {
	const authError = await verifyAuth(locals);
	if (authError) return authError;

	const { id, commentId } = params;
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
				await updateReputation(comment.userId, 1);
			} else if (response === 'Comment unliked successfully') {
				await updateReputation(comment.userId, -1);
			}
		}
		return new Response(JSON.stringify({ message: response }), {
			status: 200,
		});
	} catch (error) {
		return new Response(JSON.stringify({ error }), { status: 500 });
	}
}
