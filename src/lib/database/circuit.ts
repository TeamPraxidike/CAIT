import { prisma } from '$lib/database';
import { Prisma } from '@prisma/client/extension';
import { Difficulty, MaterialType, PublicationType } from '@prisma/client';
import { sortSwitch } from '$lib';

/**
 * [GET] Returns a publication of type Circuit with the given id.
 * @param publicationId - id of publication linked to circuit
 */
export async function getCircuitByPublicationId(publicationId: number) {
	return prisma.circuit.findUnique({
		where: { publicationId: publicationId },
		include: {
			publication: {
				include: {
					coverPic: true,
				},
			},
			nodes: {
				include: {
					publication: true,
					prerequisites: true,
					next: true,
				},
			},
		},
	});
}

/**
 * [GET] Returns the all publications of type Circuit in the database
 */
export async function getAllCircuits(
	tags: string[],
	publishers: string[],
	limit: number,
	sort: string,
	query: string,
) {
	const where: any = { AND: [] };

	if (query !== '') {
		where.AND.push({
			OR: [
				{
					publication: {
						title: { contains: query, mode: 'insensitive' },
					},
				},
				{
					publication: {
						description: { contains: query, mode: 'insensitive' },
					},
				},

				{
					publication: {
						learningObjectives: {
							hasSome: [query],
						},
					},
				},
			],
		});
	}

	if (publishers.length > 0) {
		where.AND.push({ publication: { publisherId: { in: publishers } } });
	}

	if (limit > 0) {
		where.AND.push({ numNodes: { gte: limit } });
	}

	if (tags.length > 0) {
		where.AND.push({
			publication: { tags: { some: { content: { in: tags } } } },
		});
	}

	const sortBy = sortSwitch(sort);

	return prisma.circuit.findMany({
		where,
		orderBy: sortBy,
		include: {
			publication: {
				include: {
					tags: true,
					coverPic: true,
					usedInCourse: {
						select: {
							course: true,
						},
					},
				},
			},
			nodes: false,
		},
	});
}
export async function deleteCircuitByPublicationId(
	publicationId: number,
	prismaContext: Prisma.TransactionClient = prisma,
) {
	return prismaContext.publication.delete({
		where: { id: publicationId },
		include: {
			circuit: true,
		},
	});
}

/**
 * [POST] Returns a created publication of type Circuit
 * @param userId
 * @param metaData
 * @param prismaContext
 */
export async function createCircuitPublication(
	userId: string,
	numNodes: number,
	metaData: {
		title: string;
		description: string;
		difficulty: Difficulty;
		learningObjectives: string[];
		prerequisites: string[];
	},
	prismaContext: Prisma.TransactionClient = prisma,
) {
	return prismaContext.circuit.create({
		data: {
			numNodes: numNodes,
			publication: {
				create: {
					publisherId: userId,
					title: metaData.title,
					description: metaData.description,
					difficulty: metaData.difficulty,
					learningObjectives: metaData.learningObjectives,
					prerequisites: metaData.prerequisites,
					type: PublicationType.Circuit,
				},
			},
		},
		include: {
			publication: true,
		},
	});
}

/**
 * [PUT] Returns an updated publication of type Circuit with the given id.
 * @param publicationId
 * @param metaData
 * @param prismaContext
 */
export async function updateCircuitByPublicationId(
	publicationId: number,
	metaData: {
		title: string;
		description: string;
		difficulty: Difficulty;
		learningObjectives: string[];
		prerequisites: string[];
	},
	prismaContext: Prisma.TransactionClient = prisma,
) {
	return prismaContext.circuit.update({
		where: { publicationId: publicationId },
		data: {
			publication: {
				update: {
					where: {
						id: publicationId,
					},
					data: {
						title: metaData.title,
						description: metaData.description,
						difficulty: metaData.difficulty,
						learningObjectives: metaData.learningObjectives,
						prerequisites: metaData.prerequisites,
					},
				},
			},
		},
		include: {
			publication: true,
			nodes: true,
		},
	});
}
