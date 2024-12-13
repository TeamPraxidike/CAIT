import { verifyAuth } from '$lib/database/auth';
import { type FetchedFileItem, getUserById } from '$lib/database';
import { profilePicFetcher } from '$lib/database/file';
import { getUserByUsername } from '$lib/database/user';

export async function GET({ params, locals }) {
	const authError = await verifyAuth(locals);
	if (authError) return authError;

	const { username } = params;
	try {
		const user = await getUserByUsername(username);
		if (!user)
			return new Response(JSON.stringify({ error: 'User not found' }), {
				status: 404,
			});

		// profilePic return
		const profilePicData: FetchedFileItem = profilePicFetcher(
			user.profilePic,
		);

		return new Response(JSON.stringify({ user, profilePicData }), {
			status: 200,
		});
	} catch (error) {
		return new Response(JSON.stringify({ error }), { status: 500 });
	}
}