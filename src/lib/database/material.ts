import { prisma } from '$lib/database';
import {Difficulty} from "@prisma/client";
import {Prisma} from "@prisma/client/extension";

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
 * Returns an updated publication of type Material with the given id.
 * @param publicationId
 * @param title
 * @param description
 * @param difficulty
 * @param learningObjectives
 * @param prerequisites
 * @param coverPic
 * @param copyright
 * @param timeEstimate
 * @param theoryPractice
 * @param prismaContext
 */
export async function updateMaterialByPublicationId(
	publicationId: number,
	title: string,
	description: string,
	difficulty: Difficulty,
	learningObjectives: string[],
	prerequisites: string[],
	coverPic: string,
	copyright: boolean = false,
	timeEstimate: number = 0,
	theoryPractice: number = 0,
	prismaContext: Prisma.TransactionClient = prisma
) {
	return prismaContext.material.update({
		where: { publicationId: publicationId },
		data: {
			coverPic: coverPic,
			copyright: copyright,
			timeEstimate: timeEstimate,
			theoryPractice: theoryPractice,
			publication: {
				update: {
					where:{
						id: publicationId,
					},
					data: {
						title: title,
						description: description,
						difficulty: difficulty,
						learningObjectives: learningObjectives,
						prerequisites: prerequisites
					}
				}
			}
		},
		include: {
			publication: true,
			files: true,
		}
	});
}

export async function updateMaterialConnectMaintainers(publicationId: number, maintainerConnect: number[],
													   prismaContext: Prisma.TransactionClient = prisma) {
	return prismaContext.publication.update({
		where: { id: publicationId },
		data: {
			maintainers: {
				connect: maintainerConnect.map(id => ({ id })),
			}
		},
		include:{
			materials: true
		}
	});
}

export async function updateMaterialDisconnectMaintainers(publicationId: number, maintainerDisconnect: number[],
														  prismaContext: Prisma.TransactionClient = prisma) {
	return prismaContext.publication.update({
		where: { id: publicationId },
		data: {
			maintainers: {
				disconnect: maintainerDisconnect.map(id => ({ id })),
			}
		},
		include:{
			materials: true
		}
	});
}

export async function updateMaterialConnectTags(publicationId: number, tagConnect: number[],
												prismaContext: Prisma.TransactionClient = prisma) {
	return prismaContext.publication.update({
		where: { id: publicationId },
		data: {
			tags: {
				connect: tagConnect.map(id => ({ id })),
			}
		},
		include:{
			materials: true
		}
	});
}

export async function updateMaterialDisconnectTags(publicationId: number,tagDisconnect: number[],
												   prismaContext: Prisma.TransactionClient = prisma) {
	return prismaContext.publication.update({
		where: { id: publicationId },
		data: {
			tags: {
				disconnect: tagDisconnect.map(id => ({ id })),
			}
		},
		include:{
			materials: true
		}
	});
}

/**
 * Returns the all publications of type Material in the database
 */
export async function getAllMaterials() {
    return prisma.material.findMany({
        include: {
            publication: true,
            files: false
        }
    });
}
