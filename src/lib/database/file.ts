import {
	type FetchedFileArray,
	type FileDiffActions,
	fileSystem,
	prisma,
} from '$lib/database';
import { Prisma } from '@prisma/client/extension';
import type { File as PrismaFile } from '@prisma/client';
import path from 'path';
import fs from 'fs';

export async function bufToBase64(files: FetchedFileArray) {
	// If JSON stringify cannot handle raw Buffer, use this:
	return files.map((file) => ({
		...file,
		data: file.data.toString(),
	}));
}

export function profilePicFetcher(
	profilePic: PrismaFile | null,
) {
	let filePath;

	// if coverPic is not defined (falsy), fetch default photo based on encapsulating type
	if (!profilePic) {
		filePath = path.join(
			'static',
			'defaultProfilePic',
			'profile.jpg',
		);

		const currentFileData = fs.readFileSync(filePath);

		return {
			fileId: filePath,
			data: currentFileData.toString('base64'),
		};
	} else {
		// since photo is defined, read the file based on the path (just like a File)
		filePath = profilePic.path;

		const currentFileData = fileSystem.readFile(filePath);
		return {
			fileId: filePath,
			data: currentFileData.toString('base64'),
		};
	}
}

/**
 * Fetches cover pic for corresponding publication of type material
 * @param encapsulatingType
 * @param coverPic
 */
export function coverPicFetcher(
	encapsulatingType: string,
	coverPic: PrismaFile | null,
) {
	let filePath;

	// if coverPic is not defined (falsy), fetch default photo based on encapsulating type
	if (!coverPic) {
		filePath = path.join(
			'static',
			'defaultCoverPic',
			encapsulatingType + '.jpg',
		);

		const currentFileData = fs.readFileSync(filePath);

		return {
			fileId: filePath,
			data: currentFileData.toString('base64'),
		};
	} else {
		// since photo is defined, read the file based on the path (just like a File)
		filePath = coverPic.path;

		const currentFileData = fileSystem.readFile(filePath);
		return {
			fileId: filePath,
			data: currentFileData.toString('base64'),
		};
	}
}

export async function addProfilePic(
	title: string,
	type: string,
	info: Buffer,
	userId: number,
	prismaContext: Prisma.TransactionClient = prisma,
) {
	try {
		const path = await fileSystem.saveFile(info, title);
		try {
			return prismaContext.file.create({
				data: {
					path: path,
					title: title,
					type,
					userId: userId, // Associate the pic with User
				},
			});
		} catch (errorDatabase) {
			fileSystem.deleteFile(path);
			throw new Error('Rollback');
		}
	} catch (errorFileSystem) {
		throw new Error('Rollback');
	}
}

export async function updateProfilePic(
	profilePic: { type: string; info: string } | null,
	userId: number,
	prismaContext: Prisma.TransactionClient = prisma,
) {
	// check if the material already has a coverPic
	const profilePicFile = await prismaContext.file.findUnique({
		where: {
			userId: userId,
		},
	});

	// remove if it does
	if (profilePicFile) {
		await deleteFile(profilePicFile.path, prismaContext);
	}

	// if received info about coverPic (so not default)
	if (profilePic) {
		// upload new coverPic
		const buffer: Buffer = Buffer.from(profilePic.info, 'base64');
		await addProfilePic(
			'cover.jpg',
			profilePic.type,
			buffer,
			userId,
			prismaContext,
		);
	}
}

export async function addCoverPic(
	title: string,
	type: string,
	info: Buffer,
	publicationId: number,
	prismaContext: Prisma.TransactionClient = prisma,
) {
	try {
		const path = await fileSystem.saveFile(info, title);
		try {
			return prismaContext.file.create({
				data: {
					path: path,
					title: title,
					type,
					publicationId: publicationId, // Associate the cover with Publication
				},
			});
		} catch (errorDatabase) {
			fileSystem.deleteFile(path);
			throw new Error('Rollback');
		}
	} catch (errorFileSystem) {
		throw new Error('Rollback');
	}
}

export async function updateCoverPic(
	coverPic: { type: string; info: string } | null,
	publicationId: number,
	prismaContext: Prisma.TransactionClient = prisma,
) {
	// check if the publication already has a coverPic
	const coverFile = await prismaContext.file.findUnique({
		where: {
			publicationId: publicationId,
		},
	});

	// remove if it does
	if (coverFile) {
		await deleteFile(coverFile.path, prismaContext);
	}

	// if received info about coverPic (so not default)
	if (coverPic) {
		// upload new coverPic
		const buffer: Buffer = Buffer.from(coverPic.info, 'base64');
		await addCoverPic(
			'cover.jpg',
			coverPic.type,
			buffer,
			publicationId,
			prismaContext,
		);
	}
}

export async function addFile(
	title: string,
	type: string,
	info: Buffer,
	materialId: number,
	prismaContext: Prisma.TransactionClient = prisma,
) {
	try {
		const path = await fileSystem.saveFile(info, title);
		try {
			return prismaContext.file.create({
				data: {
					path: path,
					title: title,
					type,
					materialId: materialId, // Associate the File with Material, could use connect, shouldn't matter
				},
			});
		} catch (errorDatabase) {
			fileSystem.deleteFile(path);
			throw new Error('Rollback');
		}
	} catch (errorFileSystem) {
		throw new Error('Rollback');
	}
}

/**
 * UNUSED
 * @ignore DO NOT USE NOW (missing type field)
 * @param path
 * @param title
 * @param info
 * @param prismaContext
 */
export async function editFile(
	path: string,
	title: string,
	info: Buffer,
	prismaContext: Prisma.TransactionClient = prisma,
) {
	try {
		await prismaContext.file.update({
			where: {
				path: path,
			},
			data: {
				title: title,
			},
		});

		try {
			await fileSystem.editFile(path, info);
		} catch (errorFileSystem) {
			throw new Error('Rollback');
		}
	} catch (errorDatabase) {
		throw new Error('Rollback');
	}
}

export async function deleteFile(
	path: string,
	prismaContext: Prisma.TransactionClient = prisma,
) {
	try {
		await prismaContext.file.delete({ where: { path: path } });

		try {
			fileSystem.deleteFile(path);
		} catch (errorFileSystem) {
			throw new Error('Rollback');
		}
	} catch (errorDatabase) {
		throw new Error('Rollback');
	}
}

export async function updateFiles(
	fileInfo: FileDiffActions,
	materialId: number,
	prismaContext: Prisma.TransactionClient = prisma,
) {
	// add files
	for (const file of fileInfo.add) {
		const buffer: Buffer = Buffer.from(file.info, 'base64');

		await addFile(file.title, file.type, buffer, materialId, prismaContext);
	}

	// delete files
	for (const file of fileInfo.delete) {
		await deleteFile(file.path, prismaContext);
	}

	// edit existing files
	for (const file of fileInfo.edit) {
		const buffer: Buffer = Buffer.from(file.info, 'base64');

		await editFile(file.path, file.title, buffer, prismaContext);
	}
}
