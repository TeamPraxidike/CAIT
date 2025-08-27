import { verifyAuth } from '$lib/database/auth';
import {
	type CourseWithMaintainersAndProfilePic,
	findCourseByMantainerExtended
} from '$lib/database/courses';
import { coverPicFetcher, type FetchedFileItem } from '$lib/database';
import { profilePicFetcher } from '$lib/database/file';

export async function GET({ locals, params }) {
	const authError = await verifyAuth(locals, params.id);
	if (authError) return authError;

	try {
		const courses: CourseWithMaintainersAndProfilePic[] = await findCourseByMantainerExtended(params.id);
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