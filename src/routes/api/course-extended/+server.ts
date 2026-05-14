import {
	type CourseWithMaintainersAndProfilePic,
	getAllCoursesExtended
} from '$lib/database/courses';
import { coverPicFetcher, type FetchedFileItem } from '$lib/database';
import { verifyAuth } from '$lib/database/auth.ts';

export type CourseWithProcessedProfilePic = Omit<CourseWithMaintainersAndProfilePic, "coverPic"> & {
	coverPic: FetchedFileItem
}
export async function GET({ locals }) {
	const authError = await verifyAuth(locals);
	let return_sensitive_fields = true;
	if (authError) {
		return_sensitive_fields = false;
	}

	try {
		const courses: CourseWithMaintainersAndProfilePic[] = await getAllCoursesExtended(return_sensitive_fields);
		const coursesWithAdditionalInfo: CourseWithProcessedProfilePic[] = await Promise.all(
			courses.map(async (course) => {
				const coverPic = await coverPicFetcher(null, course.coverPic);
				return { ...course, coverPic };
			})
		);
		return new Response(JSON.stringify(coursesWithAdditionalInfo), { status: 200 });
	} catch (error) {
		return new Response(JSON.stringify({ error }), { status: 500 });
	}
}