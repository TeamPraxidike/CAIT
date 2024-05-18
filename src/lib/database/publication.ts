import { Prisma } from '@prisma/client/extension';
import { prisma } from '$lib/database/prisma';

////////////////////////////////////////////////
//   HELPER METHODS
////////////////////////////////////////////////

/**
 * Main method that handles linking/unlinking of tags and maintainers to publications
 * @param request
 * @param publicationId
 * @param prismaTransaction
 */
export async function handleConnections(
	request: Request,
	publicationId: number,
	prismaTransaction: Prisma.TransactionClient = prisma,
) {
	console.log('handleConnections');
	const body = await request.json();

	console.log(body);

	if (body.maintainerConnect.length > 0) {
		await connectMaintainers(
			publicationId,
			body.maintainerConnect,
			prismaTransaction,
		);
	}
	if (body.tagConnect.length > 0) {
		await connectTags(publicationId, body.tagConnect, prismaTransaction);
	}
}

/**
 * Checks list for correctness
 * @param list
 */
export async function checkList(list: number[]) {
	for (const num of list) {
		if (isNaN(num) || num <= 0) {
			throw new Error(`Invalid number in list ${num}`);
		}
	}
}

/**
 * Connects maintainers to a publication
 * @param publicationId
 * @param maintainerConnect
 * @param prismaContext
 */
export async function connectMaintainers(
	publicationId: number,
	maintainerConnect: number[],
	prismaContext: Prisma.TransactionClient = prisma,
): Promise<void> {
	try {
		// ids of users to connect as maintainers
		await checkList(maintainerConnect);
		await updatePublicationConnectMaintainers(
			publicationId,
			maintainerConnect,
			prismaContext,
		);
	} catch (error) {
		throw new Error(`Invalid number in maintainer connect`);
	}
}

export async function connectTags(
	publicationId: number,
	tagConnect: number[],
	prismaContext: Prisma.TransactionClient = prisma,
): Promise<void> {
	try {
		// ids of tags to connect
		await checkList(tagConnect);
		await updatePublicationConnectTags(
			publicationId,
			tagConnect,
			prismaContext,
		);
	} catch (error) {
		throw new Error(`Invalid number in tag connect`);
	}
}

/////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Updates the maintainers of a publication
 *
 * @note this will first wipe all connections and then establish new ones
 * @param publicationId - id of publication
 * @param maintainerConnect - list of user ids to connect as maintainers
 * @param prismaContext - prisma transaction client
 */
export async function updatePublicationConnectMaintainers(
	publicationId: number,
	maintainerConnect: number[],
	prismaContext: Prisma.TransactionClient = prisma,
) {
	// wipe all connections
	await prismaContext.publication.update({
		where: { id: publicationId },
		data: {
			maintainers: {
				set: [],
			},
		},
	});

	// establish updated ones
	return prismaContext.publication.update({
		where: { id: publicationId },
		data: {
			maintainers: {
				connect: maintainerConnect.map((id) => ({ id })),
			},
		},
	});
}

/**
 * Updates the tags of a publication
 *
 * @note this will first wipe all connections and then establish new ones
 *
 * @param publicationId - id of publication
 * @param tagConnect - list of tag ids to connect
 * @param prismaContext - prisma transaction client
 */
export async function updatePublicationConnectTags(
	publicationId: number,
	tagConnect: number[],
	prismaContext: Prisma.TransactionClient = prisma,
) {
	// wipe all connections
	await prismaContext.publication.update({
		where: { id: publicationId },
		data: {
			tags: {
				set: [],
			},
		},
	});

	// establish new ones
	return prismaContext.publication.update({
		where: { id: publicationId },
		data: {
			tags: {
				connect: tagConnect.map((id) => ({ id })),
			},
		},
	});
}
