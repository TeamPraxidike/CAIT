import { describe, it, expect, vi } from 'vitest';

import { prisma, savePublication } from '$lib/database';
import { isPublicationSaved } from '$lib/database/save';

describe('saving publications', () => {
	it('should save a publication to the user and call the methods', async () => {
		prisma.user.findUnique = vi
			.fn()
			.mockResolvedValue({ saved: [{ id: 1 }] });
		prisma.$transaction = vi.fn().mockResolvedValue({ id: 1 });

		// Mock the prismaTransaction.user.update method
		const mockUpdate = vi.fn().mockResolvedValue({});

		// Mock prisma.$transaction to call the passed function with the mock prisma transaction object
		prisma.$transaction = vi.fn().mockImplementation(async (callback) => {
			await callback({ user: { update: mockUpdate } });
		});

		const saved = await savePublication('1', 1);

		expect(saved).toEqual('Publication unsaved successfully');

		const saved2 = await savePublication('1', 3);
		expect(saved2).toEqual('Publication saved successfully');

		const saved3 = await isPublicationSaved('1', 1);
		expect(saved3).toEqual(true);

		prisma.user.findUnique = vi.fn().mockResolvedValue(null);
		const saved4 = await isPublicationSaved('1', 1);
		expect(saved4).toEqual(false);
	});
});
