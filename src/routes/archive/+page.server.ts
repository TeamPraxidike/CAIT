import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, locals }) => {
	const session = await locals.safeGetSession();
	if (!session?.user) throw redirect(303, '/signin');

	const response = await fetch('/api/publication/archive');
	if (!response.ok) {
		throw error(response.status, 'Could not load archived publications');
	}

	return await response.json();
};

export const actions = {
	restore: async ({ request, fetch }) => {
		const data = await request.formData();
		const publicationId = Number(data.get('publicationId'));
		const courseId = Number(data.get('courseId'));
		const resourceType = data.get('resourceType');
		const resourceId = resourceType === 'course' ? courseId : publicationId;
		if (!Number.isInteger(resourceId) || resourceId <= 0) {
			return fail(400, { message: 'Invalid archive item ID' });
		}

		const response = await fetch(
			resourceType === 'course'
				? `/api/course/${courseId}/restore`
				: `/api/publication/${publicationId}/restore`,
			{ method: 'POST' },
		);

		if (!response.ok) {
			return fail(response.status, {
				message: 'Could not restore archive item',
			});
		}

		return { restored: true };
	},
} satisfies Actions;
