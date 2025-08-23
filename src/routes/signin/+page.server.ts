import { fail, redirect } from '@sveltejs/kit';

import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.safeGetSession();
	if (session?.user) throw redirect(303, '/browse');
	return { session };
};

export const actions: Actions = {
	login: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		// const email = formData.get('email') as string;
		// const password = formData.get('password') as string;

		// const { error } = await supabase.auth.signInWithPassword({ email, password });
		// if (error) {
		// 	return fail(400, { email, incorrect: true, error: error.message });
		// } else {
		// 	redirect(303, '/browse');
		// }

		const { data, error } = await supabase.auth.signInWithSSO({
			domain: 'dev-gibxq4rldhm2q1st.eu.auth0.com',
			options: {
				redirectTo: "http://localhost:5173/register/success",
			}
		})
		if (error) {
			return fail(400, { incorrect: true, error: error.message });
		} else {
			if (data?.url) {
				// redirect the user to the identity provider's authentication flow
				redirect(303, data.url)
			}
		}
	}
};