import { getEmailViewer, verifyAuth } from '$lib/database/auth';
import { type FetchedFileItem } from '$lib/database';
import { profilePicFetcher } from '$lib/database/file';
import { getUserByUsername } from '$lib/database/user';
import { redactEmail } from '$lib/util/emailVisibility';

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

		const viewer = await getEmailViewer(locals);
		const sanitizedUser = redactEmail(user, viewer);

		// profilePic return
		const profilePicData: FetchedFileItem = await profilePicFetcher(
			user.profilePic,
		);

		return new Response(JSON.stringify({ user: sanitizedUser, profilePicData }), {
			status: 200,
		});
	} catch (error) {
		return new Response(JSON.stringify({ error }), { status: 500 });
	}
}