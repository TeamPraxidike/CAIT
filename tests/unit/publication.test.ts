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
		const mockPublication = { id: 1, savedByAllTime: [] };
		prisma.publication.findUnique = vi
			.fn()
			.mockResolvedValue(mockPublication);

		prisma.publication.update = vi.fn().mockResolvedValue({});

		const result = await updateAllTimeSaved('user1', 1);

		expect(result).toEqual({});
		expect(prisma.publication.update).toHaveBeenCalledWith({
			where: { id: 1 },
			data: { savedByAllTime: ['user1'] },
		});
	});

	it('should return message if user already saved the publication', async () => {
		const mockPublication = { id: 1, savedByAllTime: ['user'] };
		prisma.publication.findUnique = vi
			.fn()
			.mockResolvedValue(mockPublication);

		const result = await updateAllTimeSaved('user', 1);

		expect(result).toEqual('User saved previously');
		expect(prisma.publication.update).not.toHaveBeenCalled();

		vi.clearAllMocks();

		prisma.publication.findUnique = vi.fn().mockResolvedValue(null);
		const result2 = await updateAllTimeSaved('user', 1);

		expect(result2).toEqual(undefined);
		expect(prisma.publication.update).not.toHaveBeenCalled();
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
