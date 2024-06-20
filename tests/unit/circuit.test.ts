import { describe, it, expect, vi } from 'vitest';
import { getAllCircuits, getCircuitByPublicationId } from '$lib/database';

import { prisma } from '$lib/database';
import { sortSwitch } from '$lib/database/circuit';

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

describe('order of circuits', () => {
	it('should return the correct indicator for order', async () => {
		expect(sortSwitch('Most Liked')).toEqual({
			publication: { likes: 'desc' },
		});
		expect(sortSwitch('Most Used')).toEqual({
			publication: { usageCount: 'desc' },
		});
		expect(sortSwitch('Oldest')).toEqual({
			publication: { createdAt: 'asc' },
		});
		expect(sortSwitch('Most Recent')).toEqual({
			publication: { createdAt: 'desc' },
		}); // Default case
		expect(sortSwitch('')).toEqual({ publication: { createdAt: 'desc' } }); // Default case
	});
});
