import { verifyAuth } from '$lib/database/auth';
import { createCourse, type createCourseData, findCourseByName, getAllCourses } from '$lib/database/courses';


export async function GET({ locals }) {
	const authError = await verifyAuth(locals, locals.user?.id);
	if (authError) return authError;

	try {
		const courses = await getAllCourses();
		return new Response(JSON.stringify(courses), { status: 200 });
	} catch (error) {
		return new Response(JSON.stringify({ error }), { status: 500 });
	}
}

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
			creatorId: body.userId,
			maintainers: body.maintainers,
			copyright: body.copyright
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