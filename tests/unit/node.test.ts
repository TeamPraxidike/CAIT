import { describe, expect, it, vi } from 'vitest';
import {
	addNode,
	deleteNode,
	fetchExtensions,
	handleEdges,
	prisma,
} from '$lib/database';
import { PublicationType } from '@prisma/client';

describe('extensions', () => {
	it('should throw error', async () => {
		prisma.publication.findUnique = vi.fn().mockResolvedValue(null);

		await expect(fetchExtensions(1)).rejects.toThrowError(
			new Error('No publication found.'),
		);
	});
	it('should return correct extensions', async () => {
		prisma.publication.findUnique = vi.fn().mockResolvedValue({
			type: PublicationType.Circuit,
			circuit: {
				id: 1,
			},
		});
		const extensions = await fetchExtensions(1);
		expect(extensions).toHaveLength(1);
		expect(extensions).toContain('circuit');

		prisma.publication.findUnique = vi.fn().mockResolvedValue({
			type: PublicationType.Material,
			materials: {
				id: 1,
				files: [
					{
						path: 'ivan.kazan',
					},
				],
			},
		});
		const extensions2 = await fetchExtensions(1);
		expect(extensions2).toHaveLength(1);
		expect(extensions2).toContain('kazan');

		expect(prisma.publication.findUnique).toHaveBeenCalled();
	});
});

describe('node actions', () => {
	it('should delete node or throw error', async () => {
		prisma.node.delete = vi
			.fn()
			.mockRejectedValue(new Error('Error while deleting node'));

		await expect(deleteNode(1, 2, prisma)).rejects.toThrowError(
			new Error('Error while deleting node'),
		);

		expect(prisma.node.delete).toHaveBeenCalled();

		prisma.node.delete = vi.fn().mockResolvedValue({ id: 1, circuitId: 2 });

		const node = await deleteNode(1, 2, prisma);
		expect(node).toMatchObject({
			id: 1,
			circuitId: 2,
		});
	});

	it('create a node or throw error', async () => {
		prisma.node.create = vi
			.fn()
			.mockRejectedValue(new Error('Error while creating node'));

		await expect(addNode(1, 2, 1, 2, prisma)).rejects.toThrowError(
			new Error('Error while creating node'),
		);

		expect(prisma.node.create).toHaveBeenCalled();

		prisma.node.create = vi
			.fn()
			.mockResolvedValue({ circuitId: 1, publicationId: 2 });

		const node = await addNode(1, 2, 1, 2, prisma);
		expect(node).toMatchObject({
			publicationId: 2,
			circuitId: 1,
		});
	});
});

describe('edges actions', () => {
	it('handle edges', async () => {
		prisma.edge.findMany = vi.fn().mockResolvedValue([
			{
				fromPublicationId: 1,
				circuitId: 2,
				toPublicationId: 5,
			},
		]);
		prisma.edge.delete = vi.fn().mockResolvedValue({
			fromPublicationId: 1,
			circuitId: 2,
			toPublicationId: 5,
		});
		prisma.edge.createMany = vi.fn().mockResolvedValue([
			{ fromPublicationId: 1, circuitId: 2, toPublicationId: 4 },
			{ fromPublicationId: 1, circuitId: 2, toPublicationId: 5 },
		]);

		await handleEdges(1, [{ fromId: 1, toId: [2, 3, 4, 3] }], prisma);

		expect(prisma.edge.delete).toHaveBeenCalledOnce;
		expect(prisma.edge.findMany).toHaveBeenCalledOnce;
		expect(prisma.edge.createMany).toHaveBeenCalledOnce;
	});
});
