import { describe, expect, it, vi } from 'vitest';
import { handleSimilarity, prisma } from '$lib/database';
import { getSimilarPublications } from '$lib/database/similarity';

describe('get all similar publications', () => {
	it('should return all materials', async () => {
		prisma.similarContent.findMany = vi
			.fn()
			.mockResolvedValue([{ toId: 3, fromId: 2, similarity: 40 }]);

		const materials = await getSimilarPublications(1);
		expect(materials).toMatchObject([
			{ toId: 3, fromId: 2, similarity: 40 },
		]);
	});
});

describe('create the similarity relations', () => {
	it('create all similarity', async () => {
		prisma.similarContent.upsert = vi
			.fn()
			.mockResolvedValue([{ toId: 3, fromId: 2, similarity: 40 }]);

		await handleSimilarity([{ toPubId: 3, fromPubId: 2, similarity: 40 }]);
		expect(prisma.similarContent.upsert).toHaveBeenCalledTimes(2);
	});
});
