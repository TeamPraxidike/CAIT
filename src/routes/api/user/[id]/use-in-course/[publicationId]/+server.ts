import {
	addPublicationToUsedInCourse,
	getPublicationById,
	getUserById,
} from '$lib/database';
import { removeFromUsedInCourse } from '$lib/database/usedInCourse';
import { verifyAuth } from '$lib/database/auth';

/**
 * Marks a publication as used in a course
 * @param params
 * @param request
 */
export async function POST({ params, request, locals }) {
	const authError = await verifyAuth(locals);
	if (authError) return authError;

	const { id, publicationId } = params;
	const user = await getUserById(id);
	if (!user)
		return new Response(JSON.stringify({ error: 'User not found' }), {
			status: 404,
		});

	const publication = await getPublicationById(parseInt(publicationId));
	if (!publication)
		return new Response(
			JSON.stringify({ error: 'Publication not found' }),
			{ status: 404 },
		);

	const body = await request.json();
	try {
		await addPublicationToUsedInCourse(
			id,
			parseInt(publicationId),
			body.courses,
		);
		return new Response('Successfully marked usage of publication', {
			status: 200,
		});
	} catch (error) {
		return new Response('Server error', { status: 500 });
	}
}

export async function DELETE({ params, url, locals }) {
	const authError = await verifyAuth(locals);
	if (authError) return authError;

	const { id, publicationId } = params;

	const user = await getUserById(id);
	if (!user)
		return new Response(JSON.stringify({ error: 'User not found' }), {
			status: 404,
		});

	const publication = await getPublicationById(parseInt(publicationId));
	if (!publication)
		return new Response(
			JSON.stringify({ error: 'Publication not found' }),
			{ status: 404 },
		);

	const coursesRes = url.searchParams.get('courses');
	if (coursesRes === null)
		return new Response(
			JSON.stringify({ error: 'Bad request - missing query parameters' }),
			{ status: 400 },
		);

	const courses = JSON.parse(coursesRes);
	if (!Array.isArray(courses)) {
		return new Response(
			JSON.stringify({
				error: 'Bad request - wrong format of query parameters',
			}),
			{ status: 400 },
		);
	}
	await removeFromUsedInCourse(parseInt(publicationId), courses);

	return new Response('Successful deletion', { status: 200 });
}
