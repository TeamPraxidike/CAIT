import { getReply, getUserById, likesReplyUpdate } from '$lib/database';
import { verifyAuth } from '$lib/database/auth';

/**
 * likes a reply
 * @param params
 * @param locals
 */
export async function POST({ params, locals }) {
	const authError = await verifyAuth(locals);
	if (authError) return authError;

	const { id, replyId } = params;
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
		return new Response(JSON.stringify({ message: response }), {
			status: 200,
		});
	} catch (error) {
		return new Response(JSON.stringify({ error }), { status: 500 });
	}
}
