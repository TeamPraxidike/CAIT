import { prisma } from '$lib/database';
import { Difficulty, MaterialType, PublicationType } from '@prisma/client';
import { Prisma } from '@prisma/client';

export type MaterialWithPublication = Prisma.MaterialGetPayload<{
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
		files: true,
	}
}>;

export type MaterialWithPublicationNoFiles = Prisma.MaterialGetPayload<{include: {publication: true}}>;

export const sortSwitch = (sort: string) => {
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
import Fuse from 'fuse.js';
import { linkCourseToPublication, removeCourseFromPublication } from '$lib/database/courses';

/**
 * [GET] Returns a publication of type Material with the given id.
 * @param publicationId - id of publication linked to material
 * @param prismaContext
 */
export async function getMaterialByPublicationId(
	publicationId: number,
	prismaContext: Prisma.TransactionClient = prisma,
){
	return prismaContext.material.findUnique({
		where: { publicationId: publicationId },
		include: {
			publication: {
				include: {
					tags: true,
					publisher: {
						include: {
							profilePic: true,
						},
					},
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
					usedInCourse: {
						select: {
							course: true,
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
	publishers: string[],
	diff: Difficulty[],
	type: MaterialType[],
	sort: string,
	query: string,
	withFiles: boolean = false
) {
// ): Promise<MaterialWithPublication[]> {
	const where: any = { AND: [], NOT: null };

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

	where.NOT = {publication: { isDraft: true } }

	const sortBy = sortSwitch(sort);
	let materials = await prisma.material.findMany({
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
			files: withFiles,
		},
	});

	if (query !== '') {
		const m = materials;
		let shouldSort = false;
		if (sort !== 'Sort By') shouldSort = true;
		const searcher = new Fuse(m, {
			keys: [
				{ name: 'publication.title', weight: 0.4 },
				{ name: 'publication.description', weight: 0.4 },
				{ name: 'publication.learningObjectives', weight: 0.2 },
			],
			isCaseSensitive: false,
			threshold: 0.6,
			shouldSort: shouldSort,
		});
		materials = searcher.search(query).map((m) => m.item);
	}

	return materials;
}

/**
 * Deletes Publication, cascades to Material
 * @param publicationId
 * @param prismaContext
 */
export async function deleteMaterialByPublicationId(
	publicationId: number,
	prismaContext: Prisma.TransactionClient = prisma,
) {
	return prismaContext.publication.delete({
		where: { id: publicationId },
		include: {
			materials: {
				include: {
					files: true,
				},
			},
			coverPic: true,
		},
	});
}


/**
 * [POST] Returns a created publication of type Material
 * @param userId
 * @param metaData
 * @param prismaContext
 */
export async function createMaterialPublication(
	userId: string,
	metaData: {
		title: string;
		description: string;
		difficulty: Difficulty;
		learningObjectives: string[];
		prerequisites: string[];
		materialType: MaterialType[];
		copyright: string;
		timeEstimate: number;
		theoryPractice: number;
		isDraft: boolean;
	},
	prismaContext: Prisma.TransactionClient = prisma,
): Promise<MaterialWithPublicationNoFiles> {
	return prismaContext.material.create({
		data: {
			copyright: metaData.copyright,
			timeEstimate: metaData.timeEstimate,
			theoryPractice: metaData.theoryPractice,
			encapsulatingType: metaData.materialType[0],
			publication: {
				create: {
					title: metaData.title,
					description: metaData.description,
					difficulty: metaData.difficulty,
					learningObjectives: metaData.learningObjectives,
					prerequisites: metaData.prerequisites,
					type: PublicationType.Material,
					publisher: {
						connect: { id: userId }
					},
					isDraft: metaData.isDraft,
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
		materialType: MaterialType[];
		copyright: string;
		timeEstimate: number;
		theoryPractice: number;
		isDraft: boolean;
		fileURLs: string[];
		course: number | null
	},
	prismaContext: Prisma.TransactionClient = prisma,
) {
	if (metaData.course === null) {
		await removeCourseFromPublication(publicationId);
	} else {
		await linkCourseToPublication(publicationId, metaData.course, prismaContext);
	}
	return prismaContext.material.update({
		where: { publicationId: publicationId },
		data: {
			encapsulatingType: metaData.materialType[0],
			fileURLs: {
				deleteMany: {},
				createMany: {
					data: metaData.fileURLs.map((url) => ({
						url: url,
						name: url,
					})),
				},
			},
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
						isDraft: metaData.isDraft
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

export async function getMaterialForFile(
	path: string,
	prismaContext: Prisma.TransactionClient = prisma,
) {
	return prismaContext.file.findUnique({
		where: {path: path},
		include: {
			material: {
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
					files: true,
				},
			}
		}
	})
}
