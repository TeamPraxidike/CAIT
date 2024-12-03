import type { PageServerLoad, Actions } from './$types';
import { redirect } from '@sveltejs/kit';
// todo: put schema
// import { signOnSchema } from '$lib/util/zod';
// import type { UserCreateForm } from '$lib/database';

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.safeGetSession();
	if (session?.user) throw redirect(303, '/browse');
	return { session };
};

export const actions: Actions = {
  register: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData()
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signUp({ email, password })
    if (error) {
      console.error(error)
      redirect(303, '/signin/error')
    } else {
      redirect(303, '/')
    }
  },
}