import { verifyAuth } from '$lib/database/auth';
import { type Course, findCourseByMantainer } from '$lib/database/courses';

export async function GET({ locals, params }) {
	const authError = await verifyAuth(locals, params.id);
	if (authError) return authError;

	try {
		const courses: Course[] = await findCourseByMantainer(params.id);
		return new Response(JSON.stringify(courses), { status: 200 });
	} catch (error) {
		return new Response(JSON.stringify({ error }), { status: 500 });
	}
}