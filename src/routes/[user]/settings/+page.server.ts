import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { setEmailVisibility } from '$lib/database';
import { isEmailVisibility } from '$lib/util/emailVisibility';

export const load: PageServerLoad = async ({ parent, locals }) => {
	const { user } = await parent();

	if (!locals.user) throw redirect(303, '/signin');
	if (locals.user.id !== user.id) throw redirect(303, `/${user.username}`);

	return {};
};

export const actions: Actions = {
	saveEmailVisibility: async ({ request, locals }) => {
		const session = await locals.safeGetSession();
		if (!session?.user) throw redirect(303, '/signin');

		const formData = await request.formData();
		const visibility = formData.get('emailVisibility')?.toString();

		if (!isEmailVisibility(visibility)) {
			return fail(400, { message: 'Invalid email visibility value' });
		}

		await setEmailVisibility(session.user.id, visibility);

		return { success: true, emailVisibility: visibility };
	},
} satisfies Actions;
