import { verifyAuth } from '$lib/database/auth';
import { deleteCourse, updateCourse } from '$lib/database/courses';

export async function DELETE({ locals, params }) {
	const authError = await verifyAuth(locals, locals.session?.user.id);
	if (authError) return authError;

	try {
		const course = await deleteCourse(Number(params.courseId));
		return new Response(JSON.stringify(course), { status: 200 });
	} catch (error) {
		return new Response(JSON.stringify({ error }), { status: 500 });
	}
}

export async function PUT({ locals, params, request }) {
    const authError = await verifyAuth(locals, locals.session?.user.id);
    if (authError) return authError;

    try {
        const body = await request.json();
        const courseId = Number(params.courseId);
        const updated = await updateCourse({
            id: courseId,
            courseName: body.courseName,
            educationalLevel: body.educationalLevel,
            learningObjectives: body.learningObjectives,
            prerequisites: body.prerequisites,
            maintainers: body.maintainers ?? [],
            currentUserId: locals.session?.user.id as string,
        });
        return new Response(JSON.stringify(updated), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error }), { status: 500 });
    }
}