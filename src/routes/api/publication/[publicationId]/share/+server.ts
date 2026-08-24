import { json } from '@sveltejs/kit';
import { verifyAuth } from '$lib/database/auth';
import { prisma } from '$lib/database/prisma';
import { createDraftShareLink } from '$lib/server/draftShare';

export async function POST({ params, locals }) {
	const authError = await verifyAuth(locals);
	if (authError) return authError;

	const publicationId = Number(params.publicationId);
	if (!Number.isInteger(publicationId) || publicationId <= 0) {
		return json({ error: 'Bad Request - Invalid ID' }, { status: 400 });
	}

	const publication = await prisma.publication.findUnique({
		where: { id: publicationId },
		select: { publisherId: true, isDraft: true },
	});

	if (!publication) return json({ error: 'Publication not found' }, { status: 404 });
	if (!publication.isDraft) {
		return json({ error: 'Only drafts need private share links' }, { status: 409 });
	}
	if (!locals.user || publication.publisherId !== locals.user.id) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const shareLink = createDraftShareLink(publicationId);
	return json(shareLink, {
		status: 201,
		headers: { 'cache-control': 'no-store' },
	});
}
