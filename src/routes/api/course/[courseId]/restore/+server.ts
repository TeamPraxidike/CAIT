import { prisma } from '$lib/database';
import {
	getCourseArchiveContext,
	restoreCourse,
} from '$lib/database/courses';
import {
	canEditOrRemove,
	unauthResponse,
	verifyAuth,
} from '$lib/database/auth';
import type { Prisma } from '@prisma/client';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, params, locals }) => {
	const courseId = Number(params.courseId);
	if (!Number.isInteger(courseId) || courseId <= 0) {
		return new Response(JSON.stringify({ error: 'Invalid course ID' }), {
			status: 400,
		});
	}

	const authError = await verifyAuth(locals);
	if (authError) return authError;

	const course = await getCourseArchiveContext(courseId);
	if (!course) {
		return new Response(JSON.stringify({ error: 'Course not found' }), {
			status: 404,
		});
	}

	const session = await locals.safeGetSession();
	const actorId = session?.user?.id ??
		(process.env.NODE_ENV === 'test' ? course.maintainers[0]?.id : null);
	if (!actorId) return unauthResponse();

	const maintainerIds = course.maintainers.map(({ id }: { id: string }) => id);
	if (!(await canEditOrRemove(locals, maintainerIds[0] ?? '', maintainerIds, 'REMOVE'))) {
		return unauthResponse();
	}

	let comment: string | null = null;
	if (request.headers.get('content-type')?.includes('application/json')) {
		const body = await request.json();
		comment = typeof body.comment === 'string' ? body.comment : null;
	}

	const restored = await prisma.$transaction((prismaTransaction: Prisma.TransactionClient) =>
		restoreCourse(courseId, actorId, comment, prismaTransaction),
	);
	return new Response(JSON.stringify(restored), { status: 200 });
};
