import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma } from '$lib/database/prisma';
import {
	handleConnections,
	checkMaintainerList,
	checkTagList,
	connectMaintainers,
	connectTags,
	updatePublicationConnectMaintainers,
	updatePublicationConnectTags,
	updateAllTimeSaved,
	getReportsPublication,
	archivePublication,
	restorePublication,
	getArchivedPublications,
} from '$lib/database/publication';

describe('handleConnections', () => {
	it('should connect maintainers and tags', async () => {
		prisma.publication.update = vi.fn().mockResolvedValue({});

		await handleConnections([], ['maintainer1'], 1);

		expect(prisma.publication.update).toHaveBeenNthCalledWith(1, {
			where: { id: 1 },
			data: { maintainers: { set: [] } },
		});
		expect(prisma.publication.update).toHaveBeenNthCalledWith(2, {
			where: { id: 1 },
			data: { maintainers: { connect: [{ id: 'maintainer1' }] } },
		});

		vi.clearAllMocks();
		prisma.publication.update = vi.fn().mockResolvedValue({});

		await handleConnections(['tag1'], [], 1);

		expect(prisma.publication.update).toHaveBeenNthCalledWith(3, {
			where: { id: 1 },
			data: { tags: { set: [] } },
		});
		expect(prisma.publication.update).toHaveBeenNthCalledWith(4, {
			where: { id: 1 },
			data: { tags: { connect: [{ content: 'tag1' }] } },
		});
	});
});

describe('checkMaintainerList', () => {
	it('should throw an error for an invalid maintainer id', async () => {
		await expect(checkMaintainerList([undefined])).rejects.toThrow(
			'Invalid id in list undefined',
		);
	});

	it('should not throw an error for a valid maintainer id', async () => {
		await expect(checkMaintainerList(['valid-id'])).resolves.not.toThrow();
	});
});

describe('checkTagList', () => {
	it('should throw an error for an invalid tag', async () => {
		await expect(checkTagList([''])).rejects.toThrow(
			'Invalid string in list ',
		);
	});

	it('should not throw an error for a valid tag', async () => {
		await expect(checkTagList(['valid-tag'])).resolves.not.toThrow();
	});
});

describe('connectMaintainers', () => {
	it('should connect maintainers to a publication', async () => {
		prisma.publication.update = vi.fn().mockResolvedValue({});

		await connectMaintainers(1, ['maintainer1'], prisma);

		expect(prisma.publication.update).toHaveBeenNthCalledWith(1, {
			where: { id: 1 },
			data: { maintainers: { set: [] } },
		});
		expect(prisma.publication.update).toHaveBeenNthCalledWith(2, {
			where: { id: 1 },
			data: { maintainers: { connect: [{ id: 'maintainer1' }] } },
		});
	});
	it('should throw an error for invalid maintainer connect', async () => {
		await expect(
			connectMaintainers(1, [undefined], prisma),
		).rejects.toThrow('Invalid number in maintainer connect');
	});
});

describe('connectTags', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should connect tags to a publication', async () => {
		prisma.publication.update = vi.fn().mockResolvedValue({});

		await connectTags(1, ['tag1'], prisma);

		expect(prisma.publication.update).toHaveBeenNthCalledWith(1, {
			where: { id: 1 },
			data: { tags: { set: [] } },
		});
		expect(prisma.publication.update).toHaveBeenNthCalledWith(2, {
			where: { id: 1 },
			data: { tags: { connect: [{ content: 'tag1' }] } },
		});
	});

	it('should throw an error for invalid tag connect', async () => {
		await expect(connectTags(1, [''], prisma)).rejects.toThrow(
			'Invalid string in tag connect',
		);
	});
});

describe('updatePublicationConnectMaintainers', () => {
	it('should wipe and then connect maintainers to a publication', async () => {
		prisma.publication.update = vi.fn().mockResolvedValue({});

		await updatePublicationConnectMaintainers(1, ['maintainer1'], prisma);

		expect(prisma.publication.update).toHaveBeenNthCalledWith(1, {
			where: { id: 1 },
			data: { maintainers: { set: [] } },
		});
		expect(prisma.publication.update).toHaveBeenNthCalledWith(2, {
			where: { id: 1 },
			data: { maintainers: { connect: [{ id: 'maintainer1' }] } },
		});
	});
});

describe('updatePublicationConnectTags', () => {
	it('should wipe and then connect tags to a publication', async () => {
		prisma.publication.update = vi.fn().mockResolvedValue({});

		await updatePublicationConnectTags(1, ['tag1'], prisma);

		expect(prisma.publication.update).toHaveBeenNthCalledWith(1, {
			where: { id: 1 },
			data: { tags: { set: [] } },
		});
		expect(prisma.publication.update).toHaveBeenNthCalledWith(2, {
			where: { id: 1 },
			data: { tags: { connect: [{ content: 'tag1' }] } },
		});
	});
});

describe('updateAllTimeSaved', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should update savedByAllTime for a publication', async () => {
		const mockPublication = { id: 1, publisherId: 'publisher' };
		prisma.publication.findFirst = vi
			.fn()
			.mockResolvedValue(mockPublication);
		prisma.savedByAllTime.findUnique = vi.fn().mockResolvedValue(null);
		prisma.savedByAllTime.create = vi.fn().mockResolvedValue({});

		const result = await updateAllTimeSaved('user1', 1);

		expect(result).toEqual({});
		expect(prisma.savedByAllTime.create).toHaveBeenCalledWith({
			data: { userId: 'user1', publicationId: 1 },
		});
	});

	it('should return message if user already saved the publication', async () => {
		const mockPublication = { id: 1, publisherId: 'publisher' };
		prisma.publication.findFirst = vi
			.fn()
			.mockResolvedValue(mockPublication);
		prisma.savedByAllTime.findUnique = vi.fn().mockResolvedValue({
			publicationId: 1,
			userId: 'user',
		});
		prisma.savedByAllTime.create = vi.fn();

		const result = await updateAllTimeSaved('user', 1);

		expect(result).toEqual('User saved previously');
		expect(prisma.savedByAllTime.create).not.toHaveBeenCalled();

		vi.clearAllMocks();

		prisma.publication.findFirst = vi.fn().mockResolvedValue(null);
		const result2 = await updateAllTimeSaved('user', 1);

		expect(result2).toEqual(undefined);
		expect(prisma.savedByAllTime.create).not.toHaveBeenCalled();
	});
});

describe('publication archive lifecycle', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('archives a publication without deleting it and records history', async () => {
		prisma.publication.findUnique = vi.fn().mockResolvedValue({
			id: 12,
			archivedAt: null,
		});
		prisma.publication.update = vi.fn().mockResolvedValue({
			id: 12,
			archivedAt: new Date(),
		});
		prisma.publication.delete = vi.fn();
		prisma.publicationHistory.create = vi.fn().mockResolvedValue({});
		prisma.circuit.updateMany = vi.fn().mockResolvedValue({ count: 1 });

		await archivePublication(12, 'actor-id', 'Outdated', prisma);

		expect(prisma.publication.update).toHaveBeenCalledWith({
			where: { id: 12 },
			data: {
				archivedAt: expect.any(Date),
				archivedById: 'actor-id',
				archiveReason: 'Outdated',
			},
		});
		expect(prisma.publicationHistory.create).toHaveBeenCalledWith({
			data: {
				action: 'ARCHIVE',
				publicationId: 12,
				userId: 'actor-id',
				comment: 'Outdated',
			},
		});
		expect(prisma.circuit.updateMany).toHaveBeenCalledWith({
			where: {
				numNodes: { gt: 0 },
				nodes: { some: { publicationId: 12 } },
			},
			data: { numNodes: { decrement: 1 } },
		});
		expect(prisma.publication.delete).not.toHaveBeenCalled();
	});

	it('restores an archived publication and records history', async () => {
		prisma.publication.findUnique = vi.fn().mockResolvedValue({
			id: 12,
			archivedAt: new Date(),
		});
		prisma.publication.update = vi.fn().mockResolvedValue({
			id: 12,
			archivedAt: null,
		});
		prisma.publicationHistory.create = vi.fn().mockResolvedValue({});
		prisma.circuit.updateMany = vi.fn().mockResolvedValue({ count: 1 });

		await restorePublication(12, 'actor-id', 'Reviewed', prisma);

		expect(prisma.publication.update).toHaveBeenCalledWith({
			where: { id: 12 },
			data: {
				archivedAt: null,
				archivedById: null,
				archiveReason: null,
			},
		});
		expect(prisma.publicationHistory.create).toHaveBeenCalledWith({
			data: {
				action: 'RESTORE',
				publicationId: 12,
				userId: 'actor-id',
				comment: 'Reviewed',
			},
		});
		expect(prisma.circuit.updateMany).toHaveBeenCalledWith({
			where: { nodes: { some: { publicationId: 12 } } },
			data: { numNodes: { increment: 1 } },
		});
	});

	it('limits a regular user archive view to owned or maintained publications', async () => {
		prisma.publication.findMany = vi.fn().mockResolvedValue([]);

		await getArchivedPublications('user-id');

		expect(prisma.publication.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: {
					archivedAt: { not: null },
					OR: [
						{ publisherId: 'user-id' },
						{ maintainers: { some: { id: 'user-id' } } },
					],
				},
			}),
		);
	});
});

describe('getReportsPublication', () => {
	it('should return report count for a publication', async () => {
		const mockCount = { _count: { reportedBy: 5 } };
		prisma.publication.findUnique = vi.fn().mockResolvedValue(mockCount);

		const result = await getReportsPublication(1);

		expect(result).toEqual(mockCount);
		expect(prisma.publication.findUnique).toHaveBeenCalledWith({
			where: { id: 1 },
			select: { _count: { select: { reportedBy: true } } },
		});
	});
});
