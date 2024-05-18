import { deleteTagByContent, getTagByContent } from '$lib/database/tag';

export async function DELETE({ params }) {
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

export async function GET({ params }) {
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
