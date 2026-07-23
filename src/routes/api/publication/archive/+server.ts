import { getArchivedPublications } from '$lib/database';
import { verifyAuth } from '$lib/database/auth';
import { isAdmin } from '$lib/database/user';
import { getArchivedCourses } from '$lib/database/courses';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
	const authError = await verifyAuth(locals);
	if (authError) return authError;

	const session = await locals.safeGetSession();
	if (!session?.user) {
		return new Response(JSON.stringify({ error: 'Unauthorized' }), {
			status: 401,
		});
	}

	const includeAll = await isAdmin(session.user.id);
	const [publications, courses] = await Promise.all([
		getArchivedPublications(session.user.id, includeAll),
		getArchivedCourses(session.user.id, includeAll),
	]);

	return new Response(JSON.stringify({ publications, courses }), { status: 200 });
};
