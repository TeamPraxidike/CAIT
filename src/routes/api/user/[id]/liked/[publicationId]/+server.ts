import {
	getPublicationById,
	getUserById,
	likePublication,
} from '$lib/database';
import { isPublicationLiked } from '$lib/database/user';

/**
 * Likes a publication
 * @param params
 */
export async function POST({ params }) {
	const { id, publicationId } = params;
	const user = await getUserById(id);
	if (!user)
		return new Response(JSON.stringify({ error: 'User not found' }), {
			status: 404,
		});

	const publication = await getPublicationById(parseInt(publicationId));
	if (!publication)
		return new Response(
			JSON.stringify({ error: 'Publication not found' }),
			{ status: 404 },
		);

	try {
		const response = await likePublication(id, parseInt(publicationId));
		return new Response(JSON.stringify({ message: response }), {
			status: 200,
		});
	} catch (error) {
		return new Response(JSON.stringify({ error }), { status: 500 });
	}
}

export async function GET({ params }) {
	const { id, publicationId } = params;
	const user = await getUserById(id);
	if (!user)
		return new Response(JSON.stringify({ error: 'User not found' }), {
			status: 404,
		});

	const publication = await getPublicationById(parseInt(publicationId));
	if (!publication)
		return new Response(
			JSON.stringify({ error: 'Publication not found' }),
			{ status: 404 },
		);

	try {
		const response = await isPublicationLiked(id, parseInt(publicationId));
		return new Response(JSON.stringify(response), { status: 200 });
	} catch (error) {
		return new Response(JSON.stringify({ error }), { status: 500 });
	}
}
