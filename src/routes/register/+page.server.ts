import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
// todo: put schema
// import { signOnSchema } from '$lib/util/zod';
// import type { UserCreateForm } from '$lib/database';

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.safeGetSession();
	if (session?.user) throw redirect(303, '/browse');
	return { session };
};

export const actions: Actions = {
	register: async ({ request, locals: { supabase }, fetch }) => {
		const formData = await request.formData();
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;
		const firstName = formData.get('firstName');
		const lastName = formData.get('lastName');

		const { error } = await supabase.auth.signUp({
			email,
			password,
			options: {
				data: { firstName, lastName }
			}
		});
		const user = await supabase.auth.getUser();
		if (user.data.user == null) {
			return fail(400, { email, firstName, lastName, incorrect: true, error: 'Error logging in' });
		}

		// The default supabase signup method does not care about our custom usernames
		// We need this to update the username after the user is created otherwise it is just an uuid
		await fetch(`/api/user/${user.data.user.id}/username`, {
			method: 'PUT',
		});

		if (error) {
			return fail(400, { email, firstName, lastName, incorrect: true, error: error.message });
		} else {
			redirect(303, '/');
		}
	}
};