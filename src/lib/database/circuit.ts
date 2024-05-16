import { prisma } from '$lib/database';
import {Prisma} from "@prisma/client/extension";
import {Difficulty} from "@prisma/client";

/**
 * [GET] Returns a publication of type Circuit with the given id.
 * @param publicationId - id of publication linked to circuit
 */
export async function getCircuitByPublicationId(publicationId: number) {
	return prisma.circuit.findUnique({
		where: { publicationId: publicationId },
		include: {
			publication: true,
			nodes: {
				include: {
					publication: true,
					prerequisites: true,
					next: true
				}
			},
		},
	});
}

/**
 * [GET] Returns the all publications of type Circuit in the database
 */
export async function getAllCircuits() {
    return prisma.circuit.findMany({
        include: {
            publication: true,
            nodes: false
        }
    });
}

/**
 * [POST] Returns an updated publication of type Circuit with the given id.
 * @param publicationId
 * @param title
 * @param description
 * @param difficulty
 * @param learningObjectives
 * @param prerequisites
 * @param prismaContext
 */
export async function updateCircuitByPublicationId(
	publicationId: number,
	title: string,
	description: string,
	difficulty: Difficulty,
	learningObjectives: string[],
	prerequisites: string[],
	prismaContext: Prisma.TransactionClient = prisma
) {
	return prismaContext.circuit.update({
		where: { publicationId: publicationId },
		data: {
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
			nodes: true,
		}
	});
}

