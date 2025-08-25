import {
	type FetchedFileItem,
	type FileDiffActions,
	fileSystem,
	prisma
} from '$lib/database';
import { Prisma } from '@prisma/client/extension';
import type { File as PrismaFile, FileChunk } from '@prisma/client';
import path from 'path';
import type { FileChunks } from '$lib/PiscinaUtils/runner';
import { addFileURL } from '$lib/database/fileURL';
import { SupabaseFileSystem } from '$lib/FileSystemPort/SupabaseFileSystem';


// // TODO: This seems to be useless, could remove if nothing breaks
// export async function bufToBase64(files: FetchedFileArray) {
// 	// If JSON stringify cannot handle raw Buffer, use this:
// 	return files.map((file) => ({
// 		...file,
// 		data: file.data.toString(),
// 	}));
// }
// export type ProfilePic = {
// 	fileId: string;
// 	data: string | null;
// }

export async function profilePicFetcher(profilePic: PrismaFile | null): Promise<FetchedFileItem> {
	let filePath;

	// if coverPic is not defined (falsy), fetch default photo based on encapsulating type
	if (!profilePic) {

		// TODO: Let frontend handle this, just return null and use static content as usual

		filePath = path.join('static', 'defaultProfilePic', 'profile.jpg');

		//const currentFileData = fs.readFileSync(filePath);
		//const currentFileData = fileSystem.readFile(filePath);

		return {
			fileId: filePath,
			//data: currentFileData.toString('base64'),
			data: null
		};
	} else {
		// since photo is defined, read the file based on the path (just like a File)
		filePath = profilePic.path;

		// const currentFileData = await fileSystem.readFile(filePath);
		// return {
		// 	fileId: filePath,
		// 	data: currentFileData.toString('base64'),
		// };
		let currentFileData;
		if (fileSystem instanceof SupabaseFileSystem) {
			currentFileData = await fileSystem.readFileURL(filePath);
		}
		else {
			currentFileData = (await fileSystem.readFile(filePath)).toString('base64'); //skipcheck
		}

		return {
			fileId: filePath,
			data: currentFileData,
		};
	}
}

/**
 * Fetches cover pic for corresponding publication of type material
 * @param encapsulatingType
 * @param coverPic
 */
export async function coverPicFetcher(
	encapsulatingType: string | null = null,
	coverPic: PrismaFile | null = null
) : Promise<FetchedFileItem> {
	let filePath;

	// if coverPic is not defined (falsy), fetch default photo based on encapsulating type
	if (!coverPic) {

		// TODO: Figure out if this picture is good enough for default

		// TODO: Let frontend handle this, just return null and use static content as usual

		filePath = path.join(
			'static',
			'defaultCoverPic',
			'assignment' + '.jpg',
		);

		//const currentFileData = fs.readFileSync(filePath);
		//const currentFileData = fileSystem.readFile(filePath);

		return {
			fileId: filePath,
			//data: currentFileData.toString('base64'),
			data: null
		};
	} else {
		// since photo is defined, read the file based on the path (just like a File)
		filePath = coverPic.path;

		// const currentFileData = await fileSystem.readFile(filePath);
		// return {
		// 	fileId: filePath,
		// 	data: currentFileData.toString('base64'),
		// };
		let currentFileData;
		if (fileSystem instanceof SupabaseFileSystem) {
			currentFileData = await fileSystem.readFileURL(filePath);
		}
		else {
			// TODO: frontend expects urls currently, add base64 checks jic
			currentFileData = (await fileSystem.readFile(filePath)).toString('base64'); //skipcheck
		}

		return {
			fileId: filePath,
			data: currentFileData,
		};
	}
}

export async function addCoverPic(
	title: string,
	type: string,
	ownerId: string,
	info: Buffer,
	publicationId: number,
	prismaContext: Prisma.TransactionClient = prisma,
) {
	try {
		const path = await fileSystem.saveFile(info, title, ownerId);
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

export async function addProfilePic(
	title: string,
	type: string,
	info: Buffer,
	userId: string,
	prismaContext: Prisma.TransactionClient = prisma,
) {
	try {
		const path = await fileSystem.saveFile(info, title, userId);
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
	userId: string,
	prismaContext: Prisma.TransactionClient = prisma,
) {
	// check if the user already has a coverPic
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
		const buffer: Buffer = Buffer.from(profilePic.info, 'base64'); //correct, skipcheck
		await addProfilePic(
			'cover.jpg',
			profilePic.type,
			buffer,
			userId,
			prismaContext,
		);
	}
}

export async function updateCoverPic(
	coverPic: { type: string; info: string } | null,
	publicationId: number,
	userId: string,
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
		const buffer: Buffer = Buffer.from(coverPic.info, 'base64'); //correct, skipcheck
		await addCoverPic(
			'cover.jpg',
			coverPic.type,
			userId,
			buffer,
			publicationId,
			prismaContext,
		);
	}
}

export async function updateCircuitCoverPic(
	coverPic: { type: string; info: string },
	publicationId: number,
	userId: string,
	prismaContext: Prisma.TransactionClient = prisma,
) {
	// check if the circuit already has a coverPic
	const coverFile = await prismaContext.file.findUnique({
		where: {
			publicationId: publicationId,
		},
	});

	// remove if it does
	if (coverFile) {
		await deleteFile(coverFile.path, prismaContext);
	}

	// upload new coverPic
	const buffer: Buffer = Buffer.from(coverPic.info, 'base64'); //correct
	await addCoverPic(
		'cover.jpg',
		coverPic.type,
		userId,
		buffer,
		publicationId,
		prismaContext,
	);
}

/**
 * Adds file to the database.
 * @param title
 * @param type
 * @param ownerId
 * @param info - could be either a Buffer or a path string.
 * It's a path string if it's derived from files associated with a material publication
 * It's Buffer if it's a cover picture/profile picture
 * @param materialId
 * @param prismaContext
 */
export async function addFile(
	title: string,
	type: string,
	ownerId: string,
	info: Buffer | string,
	materialId: number,
	prismaContext: Prisma.TransactionClient = prisma,
) {
	try {
		let path: string;
		if (info instanceof Buffer){
			path = await fileSystem.saveFile(info, title, ownerId, type);
		}
		else path = info;

		try {
			return prismaContext.file.create({
				data: {
					path: path,
					title: title,
					type: type,
					materialId: materialId, // Associate the File with Material, could use connect, shouldn't matter
				},
			});
		} catch (errorDatabase) {
			fileSystem.deleteFile(path);
			console.error(errorDatabase);
			throw new Error('Rollback Database');
		}
	} catch (errorFileSystem) {
		console.error(errorFileSystem);
		throw new Error('Rollback File system');
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
			console.error(errorFileSystem);
			throw new Error('Rollback');
		}
	} catch (errorDatabase) {
		console.error(errorDatabase);
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
			console.error(errorFileSystem);
			throw new Error('Rollback');
		}
	} catch (errorDatabase) {
		console.error(errorDatabase);
		throw new Error('Rollback');
	}
}

export async function updateFiles(
	fileInfo: FileDiffActions,
	materialId: number,
	userId: string,
	prismaContext: Prisma.TransactionClient = prisma,
) {
	// add files
	for (const file of fileInfo.add) {
		if (file.type == "URL" ) {
			await addFileURL(file.title, file.info, materialId, prismaContext);
			continue;
		}
		// const buffer: Buffer = Buffer.from(file.info, 'base64');
		const path: string = file.info;

		await addFile(file.title, file.type, userId, path, materialId, prismaContext);
	}

	// delete files
	for (const file of fileInfo.delete) {
		await deleteFile(file.path, prismaContext);
	}

	// edit existing files
	// for (const file of fileInfo.edit) {
	// 	const buffer: Buffer = Buffer.from(file.info, 'base64');
	//
	// 	await editFile(file.path, file.title, buffer, prismaContext);
	// }
}

/**
 * Method that updates file tokens
 * @param filesToUpdate
 * @param prismaContext
 */
export async function handleFileTokens(
	filesToUpdate: { filePath: string; tokens: string; chunks: FileChunks }[],
	prismaContext: Prisma.TransactionClient = prisma
) {
	for (const dataCurrent of filesToUpdate) {
		// Update file text
		await prisma.file.update({
			where: { path: dataCurrent.filePath },
			data: { text: dataCurrent.tokens }
		});

		// Delete previous documents
		await prisma.fileChunk.deleteMany({
			where: { filePath: dataCurrent.filePath }
		});

		// Insert new documents using raw SQL for the vector type
		for (const chunk of dataCurrent.chunks) {
			// Use Prisma's executeRaw to handle the vector type correctly

			// Raw query failed.Code: `22021`.Message: `ERROR: invalid byte sequence for encoding "UTF8": 0x00
			// TODO: does replace work?
			await prisma.$executeRaw`
                INSERT INTO "FileChunk" (content, metadata, embedding, "filePath")
                VALUES (${chunk.pageContent.replace(/\u0000/g, '')},
                        ${JSON.stringify(chunk.metadata)}::json,
                        ${chunk.embedding}::vector(384),
                        ${dataCurrent.filePath})
			`;
		}
	}
}

// Select embeddings which are at least 40% similar to the user query, return at most 5
export async function performCosineSimilarityWithHNSWIndex(embeddedUserQuery: number[]): Promise<(FileChunk & {similarity: number})[]>{
	return prisma.$queryRaw`
    SELECT id, content, metadata, "filePath", 
           (1 - (embedding <=> ${embeddedUserQuery}::vector)) AS similarity
    FROM public."FileChunk"
    WHERE embedding <=> ${embeddedUserQuery}::vector < 0.6  
    ORDER BY embedding <=> ${embeddedUserQuery}::vector ASC
    LIMIT 5;
    `;
}

// Cast the vector to a string format that can be parsed back to an array
export async function getFileChunks() {
	const fileChunks = await prisma.$queryRaw`
    SELECT 
      id, 
      content, 
      metadata, 
      "filePath",
      embedding::text as embedding_text
    FROM "FileChunk";
  `;

	// Parse the embedding text back to arrays if needed
	return fileChunks.map((doc: any) => ({
		id: doc.id,
		content: doc.content,
		metadata: doc.metadata,
		filePath: doc.filePath,
		embedding: doc.embedding_text ? parseVectorString(doc.embedding_text) : null
	}));
}

// Function to parse vector string back to array
function parseVectorString(vectorStr: string): number[] {
	// The format is likely [1,2,3,...], but jic
	// need to parse because prisma cannot handle vector by default and we added it as a string
	try {
		return vectorStr
			.replace('[', '')
			.replace(']', '')
			.split(',')
			.map(num => parseFloat(num.trim()));
	} catch (e) {
		console.error('Error parsing vector string:', e);
		return [];
	}
}



export async function getFilesForMaterial(
	materialId: number
) {
	return prisma.file.findMany({
		where: { materialId: materialId },
	})
}
