import {
	deleteReply,
	type editReplyData,
	getReply,
	getUserById,
	updateReply,
} from '$lib/database';
import { verifyAuth } from '$lib/database/auth';
import { validateTiptapJson } from '$lib/server/validateTiptapJson';

export async function GET({ params, locals }) {
	const authError = await verifyAuth(locals);
	if (authError) return authError;

	const { replyId } = params;
	try {
		const reply = await getReply(parseInt(replyId));
		if (!reply)
			return new Response(JSON.stringify({ error: 'Reply not found' }), {
				status: 404,
			});
		return new Response(JSON.stringify(reply), { status: 200 });
	} catch (error) {
		return new Response(JSON.stringify({ error }), { status: 500 });
	}
}

export async function DELETE({ params, locals }) {
	const { replyId } = params;
	const reply = await getReply(parseInt(replyId));
	if (!reply)
		return new Response(JSON.stringify({ error: 'Reply not found' }), {
			status: 404,
		});

	const authError = await verifyAuth(locals, reply.userId);
	if (authError) return authError;

	try {
		const reply = await deleteReply(parseInt(replyId));
		return new Response(JSON.stringify(reply), { status: 200 });
	} catch (RecordNotFound) {
		return new Response(JSON.stringify({ error: 'Comment not found' }), {
			status: 404,
		});
	}
}

export async function PUT({ params, request, locals }) {
	const body = await request.json();
	const reply = await getReply(parseInt(params.replyId));
	if (!reply)
		return new Response(JSON.stringify({ error: 'Reply not found' }), {
			status: 404,
		});

	const authError = await verifyAuth(locals, reply.userId);
	if (authError) return authError;

	const validation = validateTiptapJson(body.content);
	if (!validation.valid) {
		return new Response(JSON.stringify({ error: validation.error }), {
			status: 400,
		});
	}

	try {
		const replyData: editReplyData = {
			id: parseInt(params.replyId),
			content: body.content,
		};

		const reply = await updateReply(replyData);
		if (!reply)
			return new Response(
				JSON.stringify({ error: 'Comment not found' }),
				{
					status: 404,
				},
			);
		return new Response(JSON.stringify(reply), { status: 200 });
	} catch (error) {
		return new Response(JSON.stringify({ error }), { status: 500 });
	}
}
