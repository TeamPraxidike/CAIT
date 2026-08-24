import { canEditOrRemove, unauthResponse, verifyAuth } from '$lib/database/auth';
import { deleteCourse, getCourseByIdExtended, updateCourse } from '$lib/database/courses';
import { fileSystem, updateCoverPic } from '$lib/database';
import { prisma } from '$lib/database/prisma';

export async function DELETE({ locals, params }) {
	const courseId = Number(params.courseId);
	if (!Number.isInteger(courseId) || courseId <= 0) {
		return new Response(JSON.stringify({ error: 'Invalid course ID' }), { status: 400 });
	}

	const course = await prisma.course.findUnique({
		where: { id: courseId },
		select: {
			maintainers: { select: { id: true } },
			coverPic: { select: { path: true } },
		},
	});
	if (!course) {
		return new Response(JSON.stringify({ error: 'Course not found' }), { status: 404 });
	}

	const maintainerIds = course.maintainers.map((maintainer: { id: string }) => maintainer.id);
	if (!(await canEditOrRemove(locals, '', maintainerIds))) {
		return unauthResponse();
	}

	try {
		const deletedCourse = await deleteCourse(courseId);
		if (course.coverPic) {
			try {
				await fileSystem.deleteFile(course.coverPic.path);
			} catch (fileError) {
				// The database deletion succeeded. Do not report a false failure to
				// the user if external storage cleanup needs retrying.
				console.error('Course cover cleanup failed:', fileError);
			}
		}
		return new Response(JSON.stringify(deletedCourse), { status: 200 });
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
			copyright: body.copyright
        });

		const isCourse = true;
		await updateCoverPic(
			body.coverPic,
			updated.id,
			body.creatorId,
			isCourse
		);

        return new Response(JSON.stringify(await getCourseByIdExtended(courseId)), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error }), { status: 500 });
    }
}
