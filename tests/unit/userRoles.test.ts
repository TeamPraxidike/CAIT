import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserRole } from '@prisma/client';
import { prisma } from '$lib/database/prisma';
import { canModerate, isAdmin } from '$lib/database/user';

describe('user roles', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	it.each([
		[UserRole.USER, false, false],
		[UserRole.MODERATOR, false, true],
		[UserRole.ADMIN, false, true],
		[UserRole.USER, true, true],
	])('grants moderation access for role %s with legacy admin %s', async (role, isAdminLegacy, expected) => {
		vi.spyOn(prisma.user, 'findUnique').mockResolvedValue({
			role,
			isAdmin: isAdminLegacy,
		} as never);

		await expect(canModerate('user-id')).resolves.toBe(expected);
	});

	it('recognizes administrators stored in the role column', async () => {
		vi.spyOn(prisma.user, 'findUnique').mockResolvedValue({
			role: UserRole.ADMIN,
			isAdmin: false,
		} as never);

		await expect(isAdmin('user-id')).resolves.toBe(true);
	});
});
