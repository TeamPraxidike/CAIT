import type { PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({
	url, fetch, locals
}) => {
	// source: https://supabase.com/docs/guides/auth/sessions/pkce-flow
	const code = url.searchParams.get('code');

	if (!code){
		throw redirect(303, '/signin');
	}

	// This sets the auth cookies on the server
	const { error, data } = await locals.supabase.auth.exchangeCodeForSession(code);
	if (error) {
		throw redirect(303, '/signin');
	}

	const userRes =await fetch(`/api/user/${data.user!.id}`);

	if (!userRes.ok && userRes.status === 404) {
		return null;
	}
	else if (!userRes.ok){
		// something definitely went wrong here
		throw new Error(`Failed to update username after registration: ${userRes.statusText}`);
	}

	const userResJson = await userRes.json();

	// TODO: not the best check but it works
	// if the firstName is included, then we have already created a username => already registered
	// otherwise the username is a uuid by default, so the user is a first-timer
	if (userResJson.user.username.includes(userResJson.user.firstName)) {
		throw redirect(303, '/browse');
	}

	async function putUsername() {
		try {
			// The default supabase signup method does not care about our custom usernames
			// We need this to update the username after the user is created otherwise it is just an uuid
			const fetchRes = await fetch(`/api/user/${data.user!.id}/username`, {
				method: 'PUT',
			});

			if (!fetchRes.ok && fetchRes.status === 404) {
				return null;
			}
			else if (!fetchRes.ok){
				// something definitely went wrong here
				throw new Error(`Failed to update username after registration: ${fetchRes.statusText}`);
			}
			return await fetchRes.json();
		}
		catch (err) {
			console.error('Error while updating username after registration:\n', err);
		}
	}

	return {
		putUsernameRequest: putUsername(),
	};
};