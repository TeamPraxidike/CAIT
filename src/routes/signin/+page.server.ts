import type { Actions, PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { signIn } from '$lib/database/auth';

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth();
	if (session?.user) throw redirect(303, '/browse');
	return { session };
};
export const actions: Actions = { default: signIn };
