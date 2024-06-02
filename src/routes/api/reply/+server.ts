import { createReply, type createReplyData } from '$lib/database';
import { verifyAuth } from '$lib/database/auth';

export async function POST({ request, locals }) {
	const authError = await verifyAuth(locals);
	if (authError) return authError;

	try {
		const body = await request.json();
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
		return new Response(JSON.stringify(reply), { status: 200 });
	} catch (error) {
		return new Response(JSON.stringify({ error }), { status: 500 });
	}
}
