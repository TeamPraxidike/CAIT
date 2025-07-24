import { verifyAuth } from '$lib/database/auth';
import { deleteCourse } from '$lib/database/courses';

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