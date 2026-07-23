import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserRole } from '@prisma/client';

const { transaction } = vi.hoisted(() => ({
	transaction: vi.fn(async (callback) => callback({})),
}));

vi.mock('$lib/database', () => ({
	deleteUser: vi.fn(),
	editUser: vi.fn(),
	fileSystem: { deleteFile: vi.fn() },
	getUserById: vi.fn(),
		prisma: {
		user: { findUnique: vi.fn(), count: vi.fn() },
		$transaction: transaction,
	},
}));
vi.mock('$lib/database/file', () => ({
	profilePicFetcher: vi.fn(),
	updateProfilePic: vi.fn(),
}));
vi.mock('$lib/database/auth', () => ({
	canEditOrRemove: vi.fn(),
	getEmailViewer: vi.fn(),
	unauthResponse: () => new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 }),
	verifyAuth: vi.fn(),
}));
vi.mock('$lib/database/user', () => ({
	isAdmin: vi.fn(),
}));

import { canEditOrRemove } from '$lib/database/auth';
import { deleteUser, fileSystem, prisma } from '$lib/database';
import { isAdmin } from '$lib/database/user';
import { DELETE } from '../../src/routes/api/user/[id]/+server';

const eventFor = (actorId: string, targetId = 'target-id') => ({
	params: { id: targetId },
	locals: {
		safeGetSession: vi.fn().mockResolvedValue({ session: {}, user: { id: actorId } }),
	},
}) as never;

describe('DELETE /api/user/[id]', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.stubEnv('NODE_ENV', 'development');
		vi.mocked(canEditOrRemove).mockResolvedValue(true);
		vi.mocked(isAdmin).mockResolvedValue(false);
		vi.mocked(prisma.user.count).mockResolvedValue(2);
		vi.mocked(prisma.user.findUnique).mockResolvedValue({
			id: 'target-id',
			role: UserRole.USER,
			isAdmin: false,
			profilePic: { path: 'avatar.png' },
			posts: [{
				coverPic: { path: 'publication-cover.png' },
				materials: { files: [{ path: 'material.pdf' }] },
			}],
		} as never);
		vi.mocked(deleteUser).mockResolvedValue({
			id: 'target-id', profilePic: { path: 'avatar.png' },
		} as never);
	});

	it('uses one database deletion path and removes cascaded storage objects', async () => {
		const response = await DELETE(eventFor('target-id'));

		expect(response.status).toBe(200);
		expect(transaction).toHaveBeenCalledTimes(1);
		expect(deleteUser).toHaveBeenCalledTimes(1);
		expect(fileSystem.deleteFile).toHaveBeenCalledWith('avatar.png');
		expect(fileSystem.deleteFile).toHaveBeenCalledWith('publication-cover.png');
		expect(fileSystem.deleteFile).toHaveBeenCalledWith('material.pdf');
	});

	it('prevents a moderator from deleting another privileged user', async () => {
		vi.mocked(prisma.user.findUnique).mockResolvedValue({
			id: 'target-id', role: UserRole.MODERATOR, isAdmin: false, profilePic: null, posts: [],
		} as never);

		const response = await DELETE(eventFor('moderator-id'));
		expect(response.status).toBe(401);
		expect(deleteUser).not.toHaveBeenCalled();
	});

	it('allows an administrator to delete a privileged user', async () => {
		vi.mocked(prisma.user.findUnique).mockResolvedValue({
			id: 'target-id', role: UserRole.MODERATOR, isAdmin: false, profilePic: null, posts: [],
		} as never);
		vi.mocked(isAdmin).mockResolvedValue(true);

		const response = await DELETE(eventFor('admin-id'));
		expect(response.status).toBe(200);
		expect(deleteUser).toHaveBeenCalledTimes(1);
	});

	it('does not delete the last administrator', async () => {
		vi.mocked(prisma.user.findUnique).mockResolvedValue({
			id: 'target-id', role: UserRole.ADMIN, isAdmin: true, profilePic: null, posts: [],
		} as never);
		vi.mocked(prisma.user.count).mockResolvedValue(1);
		vi.mocked(isAdmin).mockResolvedValue(true);

		const response = await DELETE(eventFor('target-id'));
		expect(response.status).toBe(409);
		expect(deleteUser).not.toHaveBeenCalled();
	});
});
