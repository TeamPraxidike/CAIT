import { verifyAuth } from '$lib/database/auth';
import { createCourse, type createCourseData, findCourseByName } from '$lib/database/courses';

export async function POST({ request, locals }) {
	const body = await request.json();

	const authError = await verifyAuth(locals, body.userId);
	if (authError) return authError;

	try {

		const courseData: createCourseData = {
			learningObjectives: body.learningObjectives,
			prerequisites: body.prerequisites,
			educationalLevel: body.educationalLevel,
			courseName: body.courseName,
			creatorId: body.userId
		};

		if (await findCourseByName(body.courseName) !== null) {
			return new Response(JSON.stringify({ error: "Course with that name already exists" }), { status: 400 });
		}

		const course = await createCourse(body);
		return new Response(JSON.stringify(course), { status: 200 });
	} catch (error) {
		return new Response(JSON.stringify({ error }), { status: 500 });
	}
}