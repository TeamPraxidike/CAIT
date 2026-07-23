import { prisma, restorePublication } from '$lib/database';
import {
	canEditOrRemove,
	unauthResponse,
	verifyAuth,
} from '$lib/database/auth';
import { getMaintainers, getPublisher } from '$lib/database/publication';
import type { Prisma } from '@prisma/client';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, params, locals }) => {
	const publicationId = Number(params.publicationId);
	if (!Number.isInteger(publicationId) || publicationId <= 0) {
		return new Response(
			JSON.stringify({ error: 'Invalid publication ID' }),
			{
				status: 400,
			},
		);
	}

	const publisher = await getPublisher(publicationId);
	if (!publisher) {
		return new Response(
			JSON.stringify({ error: 'Publication not found' }),
			{
				status: 404,
			},
		);
	}

	const authError = await verifyAuth(locals);
	if (authError) return authError;

	const session = await locals.safeGetSession();
	if (!session?.user) return unauthResponse();
	const actorId = session.user.id;

	const maintainerIds =
		(await getMaintainers(publicationId))?.maintainers.map(
			({ id }) => id,
		) ?? [];
	if (
		!(await canEditOrRemove(
			locals,
			publisher.publisher.id,
			maintainerIds,
			'REMOVE',
		))
	) {
		return unauthResponse();
	}

	let comment: string | null = null;
	if (request.headers.get('content-type')?.includes('application/json')) {
		const body = await request.json();
		comment = typeof body.comment === 'string' ? body.comment : null;
	}

	const publication = await prisma.$transaction((prismaTransaction: Prisma.TransactionClient) =>
		restorePublication(
			publicationId,
			actorId,
			comment,
			prismaTransaction,
		),
	);

	if (!publication) {
		return new Response(
			JSON.stringify({ error: 'Publication not found' }),
			{
				status: 404,
			},
		);
	}

	return new Response(JSON.stringify(publication), { status: 200 });
};
