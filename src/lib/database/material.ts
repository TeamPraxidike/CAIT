import { prisma } from '$lib/database';
import {Difficulty, PublicationType} from "@prisma/client";
import {Prisma} from "@prisma/client/extension";

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
export async function getAllMaterials() {
	return prisma.material.findMany({
		include: {
			publication: true,
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
export async function createMaterialPublication(
	title: string,
	description: string,
	difficulty: Difficulty,
	learningObjectives: string[],
	prerequisites: string[],
	coverPic: string,
	copyright: boolean,
	timeEstimate: number,
	theoryPractice: number,
	prismaContext: Prisma.TransactionClient = prisma
) {
	return prismaContext.material.create({
		data: {
			coverPic: coverPic,
			copyright: copyright,
			timeEstimate: timeEstimate,
			theoryPractice: theoryPractice,
			publication: {
				create: {
					data: {
						title: title,
						description: description,
						difficulty: difficulty,
						learningObjectives: learningObjectives,
						prerequisites: prerequisites,
						type: PublicationType.Material
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

/**
 * [PUT] Returns an updated publication of type Material with the given id.
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
	copyright: boolean,
	timeEstimate: number,
	theoryPractice: number,
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
