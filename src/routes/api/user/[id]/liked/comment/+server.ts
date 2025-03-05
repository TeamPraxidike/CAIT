import { getLikedComments, getUserById } from '$lib/database';
import { verifyAuth } from '$lib/database/auth';

/**
 * Gets the liked comments of a user
 * @param params
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

	const liked = await getLikedComments(id);
	if (liked === null)
		return new Response(JSON.stringify({ error: 'Server error' }), {
			status: 500,
		});
	if (liked.likedComments.length === 0)
		return new Response(null, { status: 204 });

	return new Response(JSON.stringify(liked.likedComments.map((x) => x.id)), {
		status: 200,
	});
}
