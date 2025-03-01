import { getLikedPublications, getUserById } from '$lib/database';
import { verifyAuth } from '$lib/database/auth';

/**
 * Gets the liked publications of a user
 * @param params
 * @param locals
 */
export async function GET({ params, locals }) {
	const { id } = params;

	const authError = await verifyAuth(locals, id);
	if (authError) return authError;

	const user = await getUserById(id);
	if (!user)
		return new Response(JSON.stringify({ error: 'User not found' }), {
			status: 404,
		});

	const likedResponse = await getLikedPublications(id);
	if (likedResponse === null)
		return new Response(JSON.stringify({ error: 'Server error' }), {
			status: 500,
		});
	const liked = likedResponse.liked.map((x) => x.id);
	if (liked.length === 0) return new Response(null, { status: 204 });

	return new Response(JSON.stringify(liked), { status: 200 });
}
