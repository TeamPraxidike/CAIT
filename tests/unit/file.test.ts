import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma, fileSystem } from '$lib/database';
import {
	profilePicFetcher,
	coverPicFetcher,
	addCoverPic,
	addProfilePic,
	addFile,
	deleteFile,
	handleFileTokens,
	getFilesForMaterial,
} from '$lib/database/file';
import fs from 'fs';
import path from 'path';

vi.mock('fs');
vi.mock('path');
//
// describe('bufToBase64', () => {
// 	it('should convert buffer data to base64', async () => {
// 		const files = [{ fileId: '1', data: 'test' }];
// 		const result = await bufToBase64(files);
// 		expect(result[0].data).toBe('test');
// 	});
// });

describe('profilePicFetcher', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should return default profile pic if profilePic is null', () => {
		const filePath = path.join(
			'static',
			'defaultProfilePic',
			'profile.jpg',
		);
		const mockFileData = Buffer.from('defaultProfilePicData');
		fs.readFileSync = vi.fn().mockReturnValue(mockFileData);

		const result = profilePicFetcher(null);
		expect(result).toEqual({
			fileId: filePath,
			data: mockFileData.toString('base64'),
		});
	});

	it('should return profile pic data if profilePic is provided', () => {
		const profilePic = {
			path: 'profilePicPath',
			title: 'ivan',
			type: '.png',
			text: null,
			userId: null,
			publicationId: null,
			materialId: null,
		};
		const mockFileData = Buffer.from('profilePicData');
		fileSystem.readFile = vi.fn().mockReturnValue(mockFileData);

		const result = profilePicFetcher(profilePic);
		expect(result).toEqual({
			fileId: 'profilePicPath',
			data: mockFileData.toString('base64'),
		});
	});
});

describe('coverPicFetcher', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should return default cover pic if coverPic is null', () => {
		const encapsulatingType = 'assignment';
		const filePath = path.join(
			'static',
			'defaultCoverPic',
			`${encapsulatingType}.jpg`,
		);
		const mockFileData = Buffer.from('defaultCoverPicData');
		fs.readFileSync = vi.fn().mockReturnValue(mockFileData);

		const result = coverPicFetcher(encapsulatingType, null);
		expect(result).toEqual({
			fileId: filePath,
			data: mockFileData.toString('base64'),
		});
	});

	it('should return cover pic data if coverPic is provided', () => {
		const coverPic = {
			path: 'coverPicPath',
			title: 'ivan',
			type: '.png',
			text: null,
			userId: null,
			publicationId: null,
			materialId: null,
		};
		const mockFileData = Buffer.from('coverPicData');
		fileSystem.readFile = vi.fn().mockReturnValue(mockFileData);

		const result = coverPicFetcher('assignment', coverPic);
		expect(result).toEqual({
			fileId: 'coverPicPath',
			data: mockFileData.toString('base64'),
		});
	});
});

describe('addCoverPic', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should add cover pic and associate with publication', async () => {
		const info = Buffer.from('coverPicData');
		const mockPath = 'coverPicPath';
		fileSystem.saveFile = vi.fn().mockResolvedValue(mockPath);
		prisma.file.create = vi.fn().mockResolvedValue({
			path: mockPath,
			title: 'cover.jpg',
			type: 'image/jpeg',
			publicationId: 1,
		});

		const result = await addCoverPic('cover.jpg', 'image/jpeg', info, 1);
		expect(result).toEqual({
			path: mockPath,
			title: 'cover.jpg',
			type: 'image/jpeg',
			publicationId: 1,
		});
		expect(prisma.file.create).toHaveBeenCalledWith({
			data: {
				path: mockPath,
				title: 'cover.jpg',
				type: 'image/jpeg',
				publicationId: 1,
			},
		});
	});

	it('should rollback if file save fails', async () => {
		const info = Buffer.from('coverPicData');
		fileSystem.saveFile = vi
			.fn()
			.mockRejectedValue(new Error('File system error'));

		await expect(
			addCoverPic('cover.jpg', 'image/jpeg', info, 1),
		).rejects.toThrow('Rollback');
	});
});

describe('addProfilePic', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should add profile pic and associate with user', async () => {
		const info = Buffer.from('profilePicData');
		const mockPath = 'profilePicPath';
		fileSystem.saveFile = vi.fn().mockResolvedValue(mockPath);
		prisma.file.create = vi.fn().mockResolvedValue({
			path: mockPath,
			title: 'profile.jpg',
			type: 'image/jpeg',
			userId: 'user1',
		});

		const result = await addProfilePic(
			'profile.jpg',
			'image/jpeg',
			info,
			'user1',
		);
		expect(result).toEqual({
			path: mockPath,
			title: 'profile.jpg',
			type: 'image/jpeg',
			userId: 'user1',
		});
		expect(prisma.file.create).toHaveBeenCalledWith({
			data: {
				path: mockPath,
				title: 'profile.jpg',
				type: 'image/jpeg',
				userId: 'user1',
			},
		});
	});

	it('should rollback if file save fails', async () => {
		const info = Buffer.from('profilePicData');
		fileSystem.saveFile = vi
			.fn()
			.mockRejectedValue(new Error('File system error'));

		await expect(
			addProfilePic('profile.jpg', 'image/jpeg', info, 'user1'),
		).rejects.toThrow('Rollback');
	});
});

describe('addFile', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should add file and associate with material', async () => {
		const info = Buffer.from('fileData');
		const mockPath = 'filePath';
		fileSystem.saveFile = vi.fn().mockResolvedValue(mockPath);
		prisma.file.create = vi.fn().mockResolvedValue({
			path: mockPath,
			title: 'file.jpg',
			type: 'image/jpeg',
			materialId: 1,
		});

		const result = await addFile('file.jpg', 'image/jpeg', info, 1);
		expect(result).toEqual({
			path: mockPath,
			title: 'file.jpg',
			type: 'image/jpeg',
			materialId: 1,
		});
		expect(prisma.file.create).toHaveBeenCalledWith({
			data: {
				path: mockPath,
				title: 'file.jpg',
				type: 'image/jpeg',
				materialId: 1,
			},
		});
	});

	it('should rollback if file save fails', async () => {
		const info = Buffer.from('fileData');
		fileSystem.saveFile = vi
			.fn()
			.mockRejectedValue(new Error('File system error'));

		await expect(
			addFile('file.jpg', 'image/jpeg', info, 1),
		).rejects.toThrow('Rollback');
	});
});

describe('deleteFile', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should delete file from database and filesystem', async () => {
		const mockPath = 'filePath';
		prisma.file.delete = vi.fn().mockResolvedValue(undefined);
		fileSystem.deleteFile = vi.fn().mockResolvedValue(undefined);

		await deleteFile(mockPath);

		expect(prisma.file.delete).toHaveBeenCalledWith({
			where: { path: mockPath },
		});
		expect(fileSystem.deleteFile).toHaveBeenCalledWith(mockPath);
	});

	it('should handle rollback if database delete fails', async () => {
		const mockPath = 'filePath';
		prisma.file.delete = vi
			.fn()
			.mockRejectedValue(new Error('Database error'));

		await expect(deleteFile(mockPath)).rejects.toThrow('Rollback');
	});
});

describe('handleFileTokens', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should update file tokens in database', async () => {
		const filesToUpdate = [{ filePath: 'filePath', tokens: 'newTokens' }];
		prisma.file.update = vi.fn().mockResolvedValue(undefined);

		await handleFileTokens(filesToUpdate);

		expect(prisma.file.update).toHaveBeenCalledWith({
			where: { path: 'filePath' },
			data: { text: 'newTokens' },
		});
	});
});

describe('getFilesForMaterial', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should fetch files for given material id', async () => {
		const mockFiles = [{ path: 'filePath1' }, { path: 'filePath2' }];
		prisma.file.findMany = vi.fn().mockResolvedValue(mockFiles);

		const result = await getFilesForMaterial(1);

		expect(result).toEqual(mockFiles);
		expect(prisma.file.findMany).toHaveBeenCalledWith({
			where: { materialId: 1 },
		});
	});
});
