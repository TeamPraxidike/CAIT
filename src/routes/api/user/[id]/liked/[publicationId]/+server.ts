import {
	getPublicationById,
	getUserById,
	likePublication,
	updateReputation,
} from '$lib/database';
import { isPublicationLiked } from '$lib/database/user';
import { verifyAuth } from '$lib/database/auth';

/**
 * Likes a publication
 * @param params
 * @param locals
 */
export async function POST({ params, locals }) {
	const authError = await verifyAuth(locals);
	if (authError) return authError;

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

		if (id !== publication.publisherId) {
			if (response === 'Publication liked successfully') {
				await updateReputation(publication.publisherId, 2);
			} else if (response === 'Publication unliked successfully') {
				await updateReputation(publication.publisherId, -2);
			}
		}

		return new Response(JSON.stringify({ message: response }), {
			status: 200,
		});
	} catch (error) {
		return new Response(JSON.stringify({ error }), { status: 500 });
	}
}

export async function GET({ params, locals }) {
	const authError = await verifyAuth(locals);
	if (authError) return authError;

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
