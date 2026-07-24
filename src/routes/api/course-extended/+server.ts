import {
	type CourseWithMaintainersAndProfilePic,
	getAllCoursesExtended
} from '$lib/database/courses';
import { coverPicFetcher, type FetchedFileItem } from '$lib/database';

export type CourseWithProcessedProfilePic = Omit<CourseWithMaintainersAndProfilePic, "coverPic"> & {
	coverPic: FetchedFileItem
}
export async function GET() {
	try {
		const courses: CourseWithMaintainersAndProfilePic[] = await getAllCoursesExtended(false);
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