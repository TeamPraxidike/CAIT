import { prisma } from '$lib/database';
import { Difficulty, PublicationType } from '@prisma/client';
import { Prisma } from '@prisma/client/extension';

/**
 * [GET] Returns a publication of type Material with the given id.
 * @param publicationId - id of publication linked to material
 */
export async function getMaterialByPublicationId(publicationId: number) {
	return prisma.material.findUnique({
		where: { publicationId: publicationId },
		include: {
			publication: true,
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
	type: string[],
) {
	const where: any = { AND: [] };
	if (publishers.length > 0) {
		where.AND.push({ publication: { publisherId: { in: publishers } } });
	}

	if (diff.length > 0) {
		where.AND.push({ publication: { difficulty: { in: diff } } });
	}

	if (tags.length > 0) {
		where.AND.push({ tags: { some: { content: { in: tags } } } });
	}

	if (type.length > 0) {
		where.AND.push({ type: { in: type } });
	}

	return prisma.material.findMany({
		where,
		include: {
			publication: {
				include: {
					tags: true,
				},
			},
			files: false,
		},
	});
}

export async function deleteMaterialByPublicationId(publicationId: number) {
	return prisma.material.delete({
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
	metaData:{
		title: string,
		description: string,
		difficulty: Difficulty,
		learningObjectives: string[],
		prerequisites: string[],
		coverPic: string,
		copyright: boolean,
		timeEstimate: number,
		theoryPractice: number
	},
	prismaContext: Prisma.TransactionClient = prisma,
) {
	return prismaContext.material.create({
		data: {
			coverPic: metaData.coverPic,
			copyright: metaData.copyright,
			timeEstimate: metaData.timeEstimate,
			theoryPractice: metaData.theoryPractice,
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
		title: string,
		description: string,
		difficulty: Difficulty,
		learningObjectives: string[],
		prerequisites: string[],
		coverPic: string,
		copyright: boolean,
		timeEstimate: number,
		theoryPractice: number
	},
	prismaContext: Prisma.TransactionClient = prisma,
) {
	return prismaContext.material.update({
		where: { publicationId: publicationId },
		data: {
			coverPic: metaData.coverPic,
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
