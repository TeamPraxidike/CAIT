import { describe, it, expect, vi } from 'vitest';
import { getAllCircuits, getCircuitByPublicationId } from '$lib/database';

import { prisma } from '$lib/database';

describe('get specific circuit', () => {
	it('should return a circuit by publicationId', async () => {
		prisma.circuit.findUnique = vi.fn().mockResolvedValue({
			id: 2,
			publicationId: 1,
		});

		const material = await getCircuitByPublicationId(1);
		expect(material).toMatchObject({ id: 2, publicationId: 1 });
	});
});

describe('get all circuits', () => {
	it('should return all circuits', async () => {
		prisma.circuit.findMany = vi.fn().mockResolvedValue([
			{ id: 3, publicationId: 1 },
			{ id: 4, publicationId: 2 },
		]);

		const circuits = await getAllCircuits([], [], 0, 'Most Recent', '');
		expect(circuits).toHaveLength(2);
		expect(circuits[0].publicationId).toBe(1);
		expect(circuits[1].publicationId).toBe(2);
	});
});
