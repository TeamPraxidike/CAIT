import { verifyAuth } from '$lib/database/auth';
import {
	createCourse,
	type createCourseData,
	findCourseByNameExtended,
	getAllCoursesExtended
} from '$lib/database/courses';


export async function GET({ locals }) {
	const authError = await verifyAuth(locals, locals.user?.id);
	if (authError) return authError;

	try {
		const courses = await getAllCoursesExtended();
		return new Response(JSON.stringify(courses), { status: 200 });
	} catch (error) {
		return new Response(JSON.stringify({ error }), { status: 500 });
	}
}