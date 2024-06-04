import { getPublicationById, getUserById } from '$lib/database';
import { isPublicationLiked } from '$lib/database/user';
import { isPublicationSaved } from '$lib/database/save';
import { verifyAuth } from '$lib/database/auth';

/**
 * Returns user specific information for a publications, like whether it is liked or saved
 * @param params
 * @constructor
 */
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
		const liked = await isPublicationLiked(id, parseInt(publicationId));
		const saved = await isPublicationSaved(id, parseInt(publicationId));
		return new Response(JSON.stringify({ saved, liked }), { status: 200 });
	} catch (error) {
		return new Response(JSON.stringify({ error }), { status: 500 });
	}
}
