import { getCommentsByPublicationId } from '$lib/database';

export async function GET({ params }) {
	const { publicationId } = params;
	try {
		const comment = await getCommentsByPublicationId(
			parseInt(publicationId),
		);
		if (!comment)
			return new Response(
				JSON.stringify({ error: 'Publication not found' }),
				{
					status: 404,
				},
			);
		return new Response(JSON.stringify(comment), { status: 200 });
	} catch (error) {
		return new Response(JSON.stringify({ error }), { status: 500 });
	}
}
