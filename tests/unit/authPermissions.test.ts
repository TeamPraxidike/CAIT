import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('$lib/database/user', () => ({
	canModerate: vi.fn(),
	isAdmin: vi.fn(),
}));

import { canEditOrRemove } from '$lib/database/auth';
import { canModerate } from '$lib/database/user';

const localsFor = (userId: string | null) => ({
	safeGetSession: vi.fn().mockResolvedValue({
		session: userId ? {} : null,
		user: userId ? { id: userId } : null,
	}),
}) as never;

describe('content management authorization', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.stubEnv('NODE_ENV', 'development');
		vi.mocked(canModerate).mockResolvedValue(false);
	});

	it('allows the owner', async () => {
		await expect(canEditOrRemove(localsFor('owner'), 'owner', [])).resolves.toBe(true);
	});

	it('allows a maintainer', async () => {
		await expect(canEditOrRemove(localsFor('maintainer'), 'owner', ['maintainer'])).resolves.toBe(true);
	});

	it('allows moderators and administrators through the central role check', async () => {
		vi.mocked(canModerate).mockResolvedValue(true);
		await expect(canEditOrRemove(localsFor('moderator'), 'owner', [])).resolves.toBe(true);
	});

	it('rejects an unrelated regular user', async () => {
		await expect(canEditOrRemove(localsFor('regular'), 'owner', [])).resolves.toBe(false);
	});

	it('rejects unauthenticated requests', async () => {
		await expect(canEditOrRemove(localsFor(null), 'owner', [])).resolves.toBe(false);
	});
});
