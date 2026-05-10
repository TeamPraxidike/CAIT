import {
	deleteComment,
	updateComment,
	getComment,
	type editCommentData,
} from '$lib/database';
import { verifyAuth } from '$lib/database/auth';
import { validateTiptapJson } from '$lib/server/validateTiptapJson';

export async function GET({ params, locals }) {
	const authError = await verifyAuth(locals);
	if (authError) return authError;

	const { commentId } = params;
	try {
		const comment = await getComment(parseInt(commentId));
		if (!comment)
			return new Response(
				JSON.stringify({ error: 'Comment not found' }),
				{
					status: 404,
				},
			);
		return new Response(JSON.stringify(comment), { status: 200 });
	} catch (error) {
		return new Response(JSON.stringify({ error }), { status: 500 });
	}
}

export async function DELETE({ params, locals }) {
	const { commentId } = params;

	const comment = await getComment(parseInt(commentId));
	if (!comment)
		return new Response(JSON.stringify({ error: 'Comment not found' }), {
			status: 404,
		});

	const authError = await verifyAuth(locals, comment.userId);
	if (authError) return authError;

	try {
		const comment = await deleteComment(parseInt(commentId));
		return new Response(JSON.stringify(comment), { status: 200 });
	} catch (RecordNotFound) {
		return new Response(JSON.stringify({ error: 'Comment not found' }), {
			status: 404,
		});
	}
}

export async function PUT({ params, request, locals }) {
	const body = await request.json();
	const comment = await getComment(parseInt(params.commentId));
	if (!comment)
		return new Response(JSON.stringify({ error: 'Comment not found' }), {
			status: 404,
		});

	const authError = await verifyAuth(locals, comment.userId);
	if (authError) return authError;
	const validation = validateTiptapJson(body.content);
	if (!validation.valid) {
		return new Response(JSON.stringify({ error: validation.error }), {
			status: 400,
		});
	}

	try {
		const commentData: editCommentData = {
			id: parseInt(params.commentId),
			content: body.content,
		};

		const comment = await updateComment(commentData);
		if (!comment)
			return new Response(
				JSON.stringify({ error: 'Comment not found' }),
				{
					status: 404,
				},
			);
		return new Response(JSON.stringify(comment), { status: 200 });
	} catch (error) {
		return new Response(JSON.stringify({ error }), { status: 500 });
	}
}
