import { beforeEach, describe, expect, it, vi } from 'vitest';
import { prisma } from '$lib/database/prisma';
import { isAdmin } from '$lib/database/user';
import {
	canViewPublication,
	createDraftShareLink,
	draftShareExpiry,
	isValidDraftShareToken,
} from '$lib/server/draftShare';

vi.mock('$lib/database/user', () => ({
	isAdmin: vi.fn(),
}));

const publicationFindUnique = vi.spyOn(prisma.publication, 'findUnique');
const isAdminMock = vi.mocked(isAdmin);

describe('draft share links', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		process.env.AUTH_SECRET = 'test-draft-share-secret';
		isAdminMock.mockResolvedValue(false);
	});

	it('expires exactly 14 days after it is created', () => {
		const createdAt = new Date('2026-07-30T12:00:00.000Z');
		expect(draftShareExpiry(createdAt).toISOString()).toBe('2026-08-13T12:00:00.000Z');
	});

	it('accepts an untampered token only for the matching publication', () => {
		const now = new Date('2026-07-30T12:00:00.000Z');
		const { token } = createDraftShareLink(10, now);

		expect(isValidDraftShareToken(token, 10, now)).toBe(true);
		expect(isValidDraftShareToken(token, 11, now)).toBe(false);
		expect(isValidDraftShareToken(`${token}tampered`, 10, now)).toBe(false);
	});

	it('rejects an expired token', () => {
		const createdAt = new Date('2026-07-30T12:00:00.000Z');
		const { token, expiresAt } = createDraftShareLink(10, createdAt);

		expect(isValidDraftShareToken(token, 10, expiresAt)).toBe(false);
	});

	it('allows published work and draft owners without a token', async () => {
		publicationFindUnique.mockResolvedValueOnce({
			isDraft: false,
			publisherId: 'owner',
			maintainers: [],
		} as never);
		await expect(canViewPublication(1, null, null)).resolves.toBe(true);

		publicationFindUnique.mockResolvedValueOnce({
			isDraft: true,
			publisherId: 'owner',
			maintainers: [],
		} as never);
		await expect(canViewPublication(1, 'owner', null)).resolves.toBe(true);
	});

	it('requires a valid link for another user to view a draft', async () => {
		publicationFindUnique.mockResolvedValue({
			isDraft: true,
			publisherId: 'owner',
			maintainers: [],
		} as never);
		const { token } = createDraftShareLink(1);

		await expect(canViewPublication(1, 'reviewer', null)).resolves.toBe(false);
		await expect(canViewPublication(1, 'reviewer', token)).resolves.toBe(true);
		await expect(canViewPublication(2, 'reviewer', token)).resolves.toBe(false);
	});
});
