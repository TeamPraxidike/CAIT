import {
	deleteReply,
	type editReplyData,
	getReply,
	updateReply,
} from '$lib/database';

export async function GET({ params }) {
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

export async function DELETE({ params }) {
	const { replyId } = params;

	try {
		const reply = await deleteReply(parseInt(replyId));
		return new Response(JSON.stringify(reply), { status: 200 });
	} catch (RecordNotFound) {
		return new Response(JSON.stringify({ error: 'Comment not found' }), {
			status: 404,
		});
	}
}

export async function PUT({ params, request }) {
	try {
		const body = await request.json();
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
