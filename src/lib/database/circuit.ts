import { prisma } from '$lib/database';
import { Prisma } from '@prisma/client/extension';
import { Difficulty, PublicationType } from '@prisma/client';
import Fuse from 'fuse.js';

const sortSwitch = (sort: string) => {
	let orderBy: any;
	switch (sort) {
		case 'Most Liked':
			orderBy = { publication: { likes: 'desc' } };
			break;
		case 'Most Used':
			orderBy = { publication: { usageCount: 'desc' } };
			break;
		case 'Oldest':
			orderBy = { publication: { createdAt: 'asc' } };
			break;
		default:
			orderBy = { publication: { createdAt: 'desc' } }; // Default to 'Most Recent'
			break;
	}

	return orderBy;
};

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

	let circuits = await prisma.circuit.findMany({
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
					publisher: {
						include: {
							profilePic: true,
						},
					},
				},
			},
			nodes: false,
		},
	});

	if (query !== '') {
		const c = circuits;
		let shouldSort = false;
		if (sort !== 'Sort By') shouldSort = true;
		const searcher = new Fuse(c, {
			keys: [
				{ name: 'publication.title', weight: 0.4 },
				{ name: 'publication.description', weight: 0.4 },
				{ name: 'publication.learningObjectives', weight: 0.2 },
			],
			isCaseSensitive: false,
			threshold: 0.6,
			shouldSort: shouldSort,
		});
		circuits = searcher.search(query).map((c) => c.item);
	}

	return circuits;
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
 * @param numNodes
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

export async function getCircuitsContainingPublication(publicationId: number) {
	return prisma.circuit.findMany({
		where: {
			nodes: {
				some: {
					publicationId: publicationId,
				},
			},
		},
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
					publisher: {
						include: {
							profilePic: true,
						},
					},
				},
			},
		},
	});
}
