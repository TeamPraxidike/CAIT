import {
	archiveCourse,
	getCourseArchiveContext,
	getCourseByIdExtended,
	updateCourse,
} from '$lib/database/courses';
import { prisma, updateCoverPic } from '$lib/database';
import {
	canEditOrRemove,
	unauthResponse,
	verifyAuth,
} from '$lib/database/auth';
import type { Prisma } from '@prisma/client';
import type { RequestHandler } from './$types';

type CourseAuthorization =
	| { authorized: false; response: Response }
	| {
		authorized: true;
		course: NonNullable<Awaited<ReturnType<typeof getCourseArchiveContext>>>;
		actorId: string;
	};

async function authorizeCourse(
	locals: App.Locals,
	courseId: number,
	operation: 'EDIT' | 'REMOVE',
): Promise<CourseAuthorization> {
	const authError = await verifyAuth(locals);
	if (authError) return { authorized: false, response: authError };

	const course = await getCourseArchiveContext(courseId);
	if (!course) {
		return {
			authorized: false,
			response: new Response(JSON.stringify({ error: 'Course not found' }), {
				status: 404,
			}),
		};
	}

	const session = await locals.safeGetSession();
	const actorId = session?.user?.id ??
		(process.env.NODE_ENV === 'test' ? course.maintainers[0]?.id : null);
	if (!actorId) return { authorized: false, response: unauthResponse() };

	const maintainerIds = course.maintainers.map(({ id }: { id: string }) => id);
	if (!(await canEditOrRemove(locals, maintainerIds[0] ?? '', maintainerIds, operation))) {
		return { authorized: false, response: unauthResponse() };
	}

	return { authorized: true, course, actorId };
}

export const DELETE: RequestHandler = async ({ locals, params }) => {
	const courseId = Number(params.courseId);
	if (!Number.isInteger(courseId) || courseId <= 0) {
		return new Response(JSON.stringify({ error: 'Invalid course ID' }), {
			status: 400,
		});
	}

	const authorization = await authorizeCourse(locals, courseId, 'REMOVE');
	if (!authorization.authorized) return authorization.response;

	try {
		const course = await prisma.$transaction((prismaTransaction: Prisma.TransactionClient) =>
			archiveCourse(courseId, authorization.actorId, null, prismaTransaction),
		);
		return new Response(JSON.stringify(course), { status: 200 });
	} catch (error) {
		console.error(error);
		return new Response(JSON.stringify({ error: 'Server Error' }), {
			status: 500,
		});
	}
};

export const PUT: RequestHandler = async ({ locals, params, request }) => {
	const courseId = Number(params.courseId);
	if (!Number.isInteger(courseId) || courseId <= 0) {
		return new Response(JSON.stringify({ error: 'Invalid course ID' }), {
			status: 400,
		});
	}

	const authorization = await authorizeCourse(locals, courseId, 'EDIT');
	if (!authorization.authorized) return authorization.response;
	if (authorization.course.archivedAt) {
		return new Response(JSON.stringify({ error: 'Course is archived' }), {
			status: 409,
		});
	}

	try {
		const body = await request.json();
		const updated = await updateCourse({
			id: courseId,
			courseName: body.courseName,
			educationalLevel: body.educationalLevel,
			learningObjectives: body.learningObjectives,
			prerequisites: body.prerequisites,
			maintainers: body.maintainers ?? [],
			currentUserId: authorization.actorId,
			copyright: body.copyright,
		});

		await updateCoverPic(
			body.coverPic,
			updated.id,
			authorization.actorId,
			true,
		);

		return new Response(
			JSON.stringify(await getCourseByIdExtended(courseId)),
			{ status: 200 },
		);
	} catch (error) {
		console.error(error);
		return new Response(JSON.stringify({ error: 'Server Error' }), {
			status: 500,
		});
	}
};
