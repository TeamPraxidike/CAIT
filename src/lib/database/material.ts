import { deleteFile, prisma } from '$lib/database';
import {
	Difficulty,
	type File as PrismaFile,
	type Material,
	MaterialType,
	PublicationType,
} from '@prisma/client';
import { Prisma } from '@prisma/client/extension';

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
 * [GET] Returns a publication of type Material with the given id.
 * @param publicationId - id of publication linked to material
 * @param prismaContext
 */
export async function getMaterialByPublicationId(
	publicationId: number,
	prismaContext: Prisma.TransactionClient = prisma,
) {
	return prismaContext.material.findUnique({
		where: { publicationId: publicationId },
		include: {
			publication: {
				include: {
					tags: true,
					publisher: true,
					maintainers: true,
					coverPic: true,
					comments: {
						include: {
							replies: {
								include: {
									user: true,
								},
							},
							user: true,
						},
					},
				},
			},
			files: true,
		},
	});
}

/**
 * [GET] Returns the all publications of type Material in the database
 */
export async function getAllMaterials(
	tags: string[],
	publishers: number[],
	diff: Difficulty[],
	type: MaterialType[],
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

	if (diff.length > 0) {
		where.AND.push({ publication: { difficulty: { in: diff } } });
	}

	if (tags.length > 0) {
		where.AND.push({
			publication: { tags: { some: { content: { in: tags } } } },
		});
	}

	if (type.length > 0) {
		where.AND.push({ encapsulatingType: { in: type } });
	}

	const sortBy = sortSwitch(sort);
	return prisma.material.findMany({
		where,
		orderBy: sortBy,
		include: {
			publication: {
				include: {
					tags: true,
					coverPic: true,
				},
			},
			files: false,
		},
	});
}

export async function deleteMaterialByPublicationId(
	publicationId: number,
	material: Material & { files: PrismaFile[]; coverPic: PrismaFile },
	prismaContext: Prisma.TransactionClient = prisma,
) {
	for (const file of material!.files) {
		await deleteFile(file.path, prismaContext);
	}

	return prismaContext.material.delete({
		where: { publicationId: publicationId },
	});
}

/**
 * [POST] Returns a created publication of type Material
 * @param userId
 * @param metaData
 * @param prismaContext
 */
export async function createMaterialPublication(
	userId: number,
	metaData: {
		title: string;
		description: string;
		difficulty: Difficulty;
		learningObjectives: string[];
		prerequisites: string[];
		materialType: MaterialType;
		copyright: boolean;
		timeEstimate: number;
		theoryPractice: number;
	},
	prismaContext: Prisma.TransactionClient = prisma,
) {
	return prismaContext.material.create({
		data: {
			copyright: metaData.copyright,
			timeEstimate: metaData.timeEstimate,
			theoryPractice: metaData.theoryPractice,
			encapsulatingType: metaData.materialType,
			publication: {
				create: {
					title: metaData.title,
					description: metaData.description,
					difficulty: metaData.difficulty,
					learningObjectives: metaData.learningObjectives,
					prerequisites: metaData.prerequisites,
					type: PublicationType.Material,
					publisherId: userId,
				},
			},
		},
		include: {
			publication: true,
		},
	});
}

/**
 * [PUT] Returns an updated publication of type Material with the given id.
 * @param publicationId
 * @param metaData
 * @param prismaContext
 */
export async function updateMaterialByPublicationId(
	publicationId: number,
	metaData: {
		title: string;
		description: string;
		difficulty: Difficulty;
		learningObjectives: string[];
		prerequisites: string[];
		materialType: MaterialType;
		copyright: boolean;
		timeEstimate: number;
		theoryPractice: number;
	},
	prismaContext: Prisma.TransactionClient = prisma,
) {
	return prismaContext.material.update({
		where: { publicationId: publicationId },
		data: {
			encapsulatingType: metaData.materialType,
			copyright: metaData.copyright,
			timeEstimate: metaData.timeEstimate,
			theoryPractice: metaData.theoryPractice,
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
			files: true,
		},
	});
}
