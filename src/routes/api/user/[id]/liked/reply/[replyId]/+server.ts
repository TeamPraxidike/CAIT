import {
	getReply,
	getUserById,
	likesReplyUpdate,
	updateReputation,
} from '$lib/database';
import { verifyAuth } from '$lib/database/auth';

/**
 * likes a reply
 * @param params
 * @param locals
 */
export async function POST({ params, locals }) {
	const { id, replyId } = params;

	const authError = await verifyAuth(locals, id);
	if (authError) return authError;

	const user = await getUserById(id);
	if (!user)
		return new Response(JSON.stringify({ error: 'User not found' }), {
			status: 404,
		});

	const comment = await getReply(parseInt(replyId));
	if (!comment)
		return new Response(JSON.stringify({ error: 'Comment not found' }), {
			status: 404,
		});

	try {
		const response = await likesReplyUpdate(id, parseInt(replyId));

		if (id !== comment.userId) {
			if (response === 'Reply liked successfully') {
				await updateReputation(comment.userId, 9);
			} else if (response === 'Reply unliked successfully') {
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
