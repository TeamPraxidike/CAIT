import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserRole } from '@prisma/client';

vi.mock('$lib/database/prisma', () => ({
	prisma: {
		user: {
			findUnique: vi.fn(),
			count: vi.fn(),
			update: vi.fn(),
		},
	},
}));
vi.mock('$lib/database/user', () => ({
	canModerate: vi.fn(),
	isAdmin: vi.fn(),
}));

import { prisma } from '$lib/database/prisma';
import { isAdmin } from '$lib/database/user';
import { PATCH } from '../../src/routes/api/user/[id]/role/+server';

const eventFor = (role: unknown, actorId = 'admin-id', targetId = 'target-id') => ({
	params: { id: targetId },
	request: new Request('http://localhost/api/user/target-id/role', {
		method: 'PATCH',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ role }),
	}),
	locals: {
		safeGetSession: vi.fn().mockResolvedValue({ session: {}, user: { id: actorId } }),
	},
}) as never;

describe('PATCH /api/user/[id]/role', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(isAdmin).mockResolvedValue(true);
		vi.mocked(prisma.user.findUnique).mockResolvedValue({
			id: 'target-id',
			role: UserRole.USER,
			isAdmin: false,
		} as never);
		vi.mocked(prisma.user.update).mockImplementation(async ({ data }: {
			data: { role: UserRole; isAdmin: boolean };
		}) => ({
			id: 'target-id',
			role: data.role,
			isAdmin: data.isAdmin,
		}) as never);
	});

	it('allows an administrator to promote a moderator', async () => {
		const response = await PATCH(eventFor(UserRole.MODERATOR));
		expect(response.status).toBe(200);
		expect(prisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
			data: { role: UserRole.MODERATOR, isAdmin: false },
		}));
	});

	it('synchronizes the legacy admin field', async () => {
		await PATCH(eventFor(UserRole.ADMIN));
		expect(prisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
			data: { role: UserRole.ADMIN, isAdmin: true },
		}));
	});

	it('rejects non-administrators', async () => {
		vi.mocked(isAdmin).mockResolvedValue(false);
		const response = await PATCH(eventFor(UserRole.MODERATOR));
		expect(response.status).toBe(401);
		expect(prisma.user.update).not.toHaveBeenCalled();
	});

	it('rejects invalid roles', async () => {
		const response = await PATCH(eventFor('OWNER'));
		expect(response.status).toBe(400);
		expect(prisma.user.update).not.toHaveBeenCalled();
	});

	it('does not demote the last administrator', async () => {
		vi.mocked(prisma.user.findUnique).mockResolvedValue({
			id: 'target-id',
			role: UserRole.ADMIN,
			isAdmin: true,
		} as never);
		vi.mocked(prisma.user.count).mockResolvedValue(1);

		const response = await PATCH(eventFor(UserRole.USER));
		expect(response.status).toBe(409);
		expect(prisma.user.update).not.toHaveBeenCalled();
	});
});
