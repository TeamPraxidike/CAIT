import { getReply, getUserById, likesReplyUpdate } from '$lib/database';

/**
 * likes a reply
 * @param params
 */
export async function POST({ params }) {
	const { id, replyId } = params;
	const user = await getUserById(parseInt(id));
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
		const response = await likesReplyUpdate(
			parseInt(id),
			parseInt(replyId),
		);
		console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
		return new Response(JSON.stringify({ message: response }), {
			status: 200,
		});
	} catch (error) {
		return new Response(JSON.stringify({ error }), { status: 500 });
	}
}
