import { deleteTagByContent, getTagByContent } from '$lib/database/tag';
import { verifyAuth } from '$lib/database/auth';

export async function DELETE({ params, locals }) {
	const authError = await verifyAuth(locals);
	if (authError) return authError;
	const content = params.content;

	if (content === '' || !content) {
		return new Response(
			JSON.stringify({
				error: 'Bad Delete Request - Invalid Tag',
			}),
			{ status: 400 },
		);
	}

	try {
		const tag = await getTagByContent(content);

		if (!tag) {
			return new Response(JSON.stringify({ error: 'Tag Not Found' }), {
				status: 404,
			});
		}

		await deleteTagByContent(content);
		return new Response(JSON.stringify(tag), { status: 200 });
	} catch (error) {
		return new Response(JSON.stringify({ error: 'Server Error' }), {
			status: 500,
		});
	}
}

export async function GET({ params, locals }) {
	const authError = await verifyAuth(locals);
	if (authError) return authError;

	const content = params.content;

	if (content === '' || !content) {
		return new Response(
			JSON.stringify({
				error: 'Bad Request - Invalid Tag',
			}),
			{ status: 400 },
		);
	}

	try {
		const tag = await getTagByContent(content);

		if (!tag) {
			return new Response(JSON.stringify({ error: 'Tag Not Found' }), {
				status: 404,
			});
		}

		return new Response(JSON.stringify(tag), { status: 200 });
	} catch (error) {
		return new Response(JSON.stringify({ error: 'Server Error' }), {
			status: 500,
		});
	}
}
