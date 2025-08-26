import { verifyAuth } from '$lib/database/auth';
import {
	createCourse,
	type createCourseData,
	findCourseByNameExtended,
	getAllCoursesExtended
} from '$lib/database/courses';
import { coverPicFetcher } from '$lib/database';


export async function GET({ locals }) {
	const authError = await verifyAuth(locals, locals.user?.id);
	if (authError) return authError;

	try {
		const courses = await getAllCoursesExtended();
		const coursesWithPics = await Promise.all(
			courses.map(async (course) => {
				const coverPic = await coverPicFetcher(null, course.coverPic);
				return { ...course, coverPic };
			})
		);
		return new Response(JSON.stringify(coursesWithPics), { status: 200 });
	} catch (error) {
		return new Response(JSON.stringify({ error }), { status: 500 });
	}
}