import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { prisma } from '$lib/database/prisma';
import { isAdmin } from '$lib/database/user';

export const DRAFT_SHARE_DURATION_DAYS = 14;

type DraftSharePayload = {
	publicationId: number;
	expiresAt: number;
};

function getSigningSecret(): string {
	const secret = process.env.AUTH_SECRET;
	if (!secret) throw new Error('AUTH_SECRET is required to create draft share links');
	return secret;
}

function sign(value: string): Buffer {
	return createHmac('sha256', getSigningSecret()).update(value).digest();
}

export function draftShareExpiry(now = new Date()): Date {
	const expiresAt = new Date(now);
	expiresAt.setUTCDate(expiresAt.getUTCDate() + DRAFT_SHARE_DURATION_DAYS);
	return expiresAt;
}

export function createDraftShareLink(publicationId: number, now = new Date()) {
	const expiresAt = draftShareExpiry(now);
	const payload: DraftSharePayload = {
		publicationId,
		expiresAt: expiresAt.getTime(),
	};
	const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
	const nonce = randomBytes(16).toString('base64url');
	const signedValue = `${encodedPayload}.${nonce}`;
	const signature = sign(signedValue).toString('base64url');

	return { token: `${signedValue}.${signature}`, expiresAt };
}

export function isValidDraftShareToken(
	token: string,
	publicationId: number,
	now = new Date(),
): boolean {
	try {
		const [encodedPayload, nonce, encodedSignature, ...extra] = token.split('.');
		if (!encodedPayload || !nonce || !encodedSignature || extra.length) return false;

		const expectedSignature = sign(`${encodedPayload}.${nonce}`);
		const suppliedSignature = Buffer.from(encodedSignature, 'base64url');
		if (
			expectedSignature.length !== suppliedSignature.length ||
			!timingSafeEqual(expectedSignature, suppliedSignature)
		) return false;

		const payload = JSON.parse(
			Buffer.from(encodedPayload, 'base64url').toString('utf8'),
		) as DraftSharePayload;

		return (
			payload.publicationId === publicationId &&
			Number.isFinite(payload.expiresAt) &&
			payload.expiresAt > now.getTime()
		);
	} catch {
		return false;
	}
}

/** Drafts require an owner role or a valid 14-day share token. */
export async function canViewPublication(
	publicationId: number,
	viewerId: string | null | undefined,
	token: string | null | undefined,
): Promise<boolean> {
	const publication = await prisma.publication.findUnique({
		where: { id: publicationId },
		select: {
			isDraft: true,
			publisherId: true,
			maintainers: { select: { id: true } },
		},
	});

	if (!publication) return false;
	if (!publication.isDraft) return true;

	if (viewerId) {
		if (publication.publisherId === viewerId) return true;
		if (publication.maintainers.some(({ id }: { id: string }) => id === viewerId)) return true;
		if (await isAdmin(viewerId)) return true;
	}

	return token ? isValidDraftShareToken(token, publicationId) : false;
}
