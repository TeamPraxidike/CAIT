import type { LayoutServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import type {TGETuser} from '../api/user/[id]/+server';

/**
 * User is the slug in the parameter.
 * Fetch the user with the given slug.
 * It could be a user id which is bad for SEO or a slug from their name which is much preferable!
 * Examples of slugs: 'john-doe', 'jane-doe', 'jane-smith'
 */
export const load: LayoutServerLoad = async ({ params, fetch, locals, depends }) => {
	depends('supabase:auth')
	//const session = await locals.safeGetSession();

	const session = locals.session;

	if (!session) throw redirect(303, '/signin');
	
	// const uRes = await fetch(`/api/course/username/${params.course}`);
};
