import {
	deleteComment,
	updateComment,
	getComment,
	type editCommentData,
} from '$lib/database';
import { verifyAuth } from '$lib/database/auth';

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

export async function DELETE({ params }) {
	const { commentId } = params;

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
	const authError = await verifyAuth(locals);
	if (authError) return authError;
	try {
		const body = await request.json();
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
