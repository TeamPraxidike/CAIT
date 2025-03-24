import { Prisma } from '@prisma/client';
import { prisma } from '$lib/database/prisma';
import { getPublicationById } from '$lib/database/db';

////////////////////////////////////////////////
//   HELPER METHODS
////////////////////////////////////////////////

export type PublicationReportsCount = Prisma.PublicationGetPayload<{
	select: {
		_count: {
			select: {
				reportedBy: true;
			}
		}
	}
}>;

export type PublicationWithPublisherId = Prisma.PublicationGetPayload<{
	select: {
		publisherId: true
	}
}>;

/**
 * Main method that handles linking/unlinking of tags and maintainerIds to publications
 * @param tags
 * @param maintainers
 * @param publicationId
 * @param prismaTransaction
 */
export async function handleConnections(
	tags: string[],
	maintainers: string[],
	publicationId: number,
	prismaTransaction: Prisma.TransactionClient = prisma,
) {
	await connectMaintainers(publicationId, maintainers, prismaTransaction);
	await connectTags(publicationId, tags, prismaTransaction);
}

/**
 * Checks list for correctness in maintainerIds
 * @param list
 */
export async function checkMaintainerList(list: (string | undefined)[]) {
	for (const id of list) {
		if (id === undefined) {
			throw new Error(`Invalid id in list ${id}`);
		}
	}
}

/**
 * Checks list for correctness in tags
 * @param list
 */
export async function checkTagList(list: string[]) {
	for (const str of list) {
		if (str.length === 0) {
			throw new Error(`Invalid string in list ${str}`);
		}
	}
}

/**
 * Connects maintainerIds to a publication
 * @param publicationId
 * @param maintainerConnect
 * @param prismaContext
 */
export async function connectMaintainers(
	publicationId: number,
	maintainerConnect: (string | undefined)[],
	prismaContext: Prisma.TransactionClient = prisma,
): Promise<void> {
	try {
		// ids of users to connect as maintainerIds
		await checkMaintainerList(maintainerConnect);
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
	tagConnect: string[],
	prismaContext: Prisma.TransactionClient = prisma,
): Promise<void> {
	try {
		// ids of tags to connect
		await checkTagList(tagConnect);
		await updatePublicationConnectTags(
			publicationId,
			tagConnect,
			prismaContext,
		);
	} catch (error) {
		throw new Error(`Invalid string in tag connect`);
	}
}

export async function getMaintainers(
	publicationId: number,
	prismaContext: Prisma.TransactionClient = prisma,
) {
	try {
		return prismaContext.publication.findUnique({
			where: { id: publicationId },
			select: {
				maintainers: true
			}
		});
	} catch (error) {
		throw new Error(`Could not get publication maintainers`);
	}
}

export async function getPublisher(
	publicationId: number,
	prismaContext: Prisma.TransactionClient = prisma,
) {
	try {
		return prismaContext.publication.findUnique({
			where: { id: publicationId },
			select: {
				publisher: true
			}
		});
	} catch (error) {
		throw new Error(`Could not get publication publisher`);
	}
}
/////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Updates the maintainerIds of a publication
 *
 * @note this will first wipe all connections and then establish new ones
 * @param publicationId - id of publication
 * @param maintainerConnect - list of user ids to connect as maintainerIds
 * @param prismaContext - prisma transaction client
 */
export async function updatePublicationConnectMaintainers(
	publicationId: number,
	maintainerConnect: (string | undefined)[],
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
 * @param tagConnect - list of tag contents to connect
 * @param prismaContext - prisma transaction client
 */
export async function updatePublicationConnectTags(
	publicationId: number,
	tagConnect: string[],
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
				connect: tagConnect.map((content: string) => ({
					content: content.toLowerCase(),
				})),
			},
		},
	});
}
/**
 * update all time people who have saved the publication with id publicationId
 * @param id - the id of the user who is saving it now
 * @param publicationId -
 */
export async function updateAllTimeSaved(id: string, publicationId: number) {
	const publication = await getPublicationById(publicationId);
	if (publication) {
		let allTime = publication.savedByAllTime;
		if (!allTime.includes(id)) {
			allTime = [...allTime, id];
			return prisma.publication.update({
				where: { id: publicationId },
				data: {
					savedByAllTime: allTime,
				},
			});
		}
		return 'User saved previously';
	}
}

export async function getReportsPublication(publicationId: number): Promise<PublicationReportsCount> {
	return prisma.publication.findUnique({
		where: {
			id: publicationId,
		},
		select: {
			_count: {
				select: {
					reportedBy: true,
				},
			},
		},
	});
}

export async function getPublisherId(publicationId: number): Promise<PublicationWithPublisherId> {
	return prisma.publication.findUnique({
		where: {
			id: publicationId,
		},
		select: {
			publisherId: true
		}
	});
}
