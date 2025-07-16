import { verifyAuth } from '$lib/database/auth';
import { createComment, type createCommentData, getPublicationById, updateReputation } from '$lib/database';
import { createCourse, type createCourseData } from '$lib/database/courses';

export async function POST({ request, locals }) {
	const body = await request.json();

	const authError = await verifyAuth(locals, body.userId);
	if (authError) return authError;

	try {

		const courseData: createCourseData = {
			learningObjectives: body.learningObjectives,
			prerequisites: body.prerequisites,
			educationalLevel: body.educationalLevel,
			courseName: body.courseName
		};

		const course = await createCourse(courseData);
		return new Response(JSON.stringify(course), { status: 200 });
	} catch (error) {
		return new Response(JSON.stringify({ error }), { status: 500 });
	}
}