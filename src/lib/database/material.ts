import { prisma } from '$lib/database';
import { Difficulty } from '@prisma/client';

/**
 * Returns a publication of type Material with the given id.
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
 * Returns the all publications of type Material in the database
 */
export async function getAllMaterials(
	tags: string[],
	publishers: number[],
	diff: Difficulty[],
	type: string[],
) {
	const where: any = { AND: [] };
	if (publishers.length > 0) {
		where.AND.push({ publisherId: { in: publishers } });
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

	console.log('WhereClause');
	console.log(where);

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
