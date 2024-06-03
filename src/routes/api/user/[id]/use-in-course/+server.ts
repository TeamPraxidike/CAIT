import { getUserById, publicationsAUserUses } from '$lib/database';
import { verifyAuth } from '$lib/database/auth';

/**
 * Gets all publications that a user uses in any course
 * @param params
 * @constructor
 */
export async function GET({ params, locals }) {
	const authError = await verifyAuth(locals);
	if (authError) return authError;

	const { id } = params;
	const user = await getUserById(id);
	if (!user)
		return new Response(JSON.stringify({ error: 'User not found' }), {
			status: 404,
		});

	const used = (await publicationsAUserUses(id)).map((x) => x.id);
	if (used.length === 0) return new Response(null, { status: 204 });

	return new Response(JSON.stringify(used), { status: 200 });
}
