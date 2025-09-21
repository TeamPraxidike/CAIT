import {
	createReply,
	type createReplyData,
	getComment,
	updateReputation,
} from '$lib/database';
import { verifyAuth } from '$lib/database/auth';

export async function POST({ request, locals }) {
	const body = await request.json();
	const authError = await verifyAuth(locals, body.userId);
	if (authError) return authError;

	try {
		const replyData: createReplyData = {
			userId: body.userId,
			commentId: body.commentId,
			content: body.content,
		};

		const reply = await createReply(replyData);
		if (!reply)
			return new Response(
				JSON.stringify({ error: 'Comment or user not found' }),
				{
					status: 404,
				},
			);

		const comment = await getComment(body.commentId);

		if (comment?.userId === body.userId) {
			await updateReputation(body.userId, 2);
		} else {
			await updateReputation(body.userId, 5);
		}

		return new Response(JSON.stringify(reply), { status: 200 });
	} catch (error) {
		return new Response(JSON.stringify({ error }), { status: 500 });
	}
}
