import { Difficulty, MaterialType, PublicationType } from '@prisma/client';
import { Prisma } from '@prisma/client/extension';

import { prisma } from '$lib/database';
import Fuse from 'fuse.js';

/**
 * Creates a new publication with the given data. Sets the likes to 0.
 * @param title
 * @param description
 * @param difficulty
 * @param publisherId
 * @param type
 * @param prismaContext
 */
async function createPublication(
	title: string,
	description: string,
	difficulty: Difficulty,
	publisherId: number,
	type: PublicationType,
	prismaContext: Prisma.TransactionClient = prisma, // default to normal client or use argument
) {
	return prismaContext.publication.create({
		data: {
			title: title,
			description: description,
			likes: 0,
			difficulty: difficulty,
			publisherId: publisherId,
			type: type,
		},
	});
}

// /**
//  * Creates a new publication of type Material with the given data. Sets the likes to 0.
//  * @param materialData This is an object that contains the id of the user who created the material,
//  * the title, the description, the difficulty, the time estimate,
//  * the theory to practice ratio, the files and the type of the material (dataset, assignment, etc.).
//  */
// export async function createMaterialPublication(
//     materialData: {
//         userId: number, // TODO may be better to be the user, dont know how to specify type then
//         title: string,
//         description: string,
//         copyright: boolean,
//         difficulty: Difficulty, // TODO figure out how to make people using this not import Difficulty type from prisma
//         timeEstimate?: number,
//         theoryPractice?: number,
//         paths?: string[],
//         titles?: string[]
//     }
// ) {
//     return await prisma.$transaction(async (prismaTransaction) => {
//         const publication = await createPublication(
//             materialData.title,
//             materialData.description,
//             materialData.difficulty,
//             materialData.userId,
//             PublicationType.Material,
//             prismaTransaction
//         );
//
//         const material = await prismaTransaction.material.create({
//             data: {
//                 publicationId: publication.id,
//                 timeEstimate: materialData.timeEstimate,
//                 theoryPractice: materialData.theoryPractice,
//                 copyright: materialData.copyright,
//             }
//         });
//
//         if(materialData.paths === undefined || materialData.titles === undefined) return material;
//
//         await addFiles(materialData.paths, materialData.titles, material.id, prismaTransaction);
//         return material;
//     })
// }

/**
 * Creates a new publication of type Circuit with the given data.
 * @param circuitData This is an object that contains the id of the user who created the circuit,
 * the title, the description and the difficulty
 */
export async function createCircuitPublication(circuitData: {
	userId: number; // may have to be the user, dont know how to specify type then
	title: string;
	description: string;
	copyright: boolean;
	difficulty: Difficulty;
}) {
	return prisma.$transaction(async (prismaTransaction) => {
		const publication = await createPublication(
			circuitData.title,
			circuitData.description,
			circuitData.difficulty,
			circuitData.userId,
			PublicationType.Circuit,
			prismaTransaction,
		);

		return prismaTransaction.circuit.create({
			data: {
				publicationId: publication.id,
			},
		});
	});
}

/**
 * Returns the publication with the given id. Gives no guarantee for the type of the publication.
 * @param id
 */
export async function getPublicationById(id: number) {
	return prisma.publication.findUnique({
		where: {
			id: id,
		},
		include: {
			usedInCourse: true,
			tags: true,
			publisher: {
				include: {
					profilePic: true,
				},
			},
			maintainers: {
				include: {
					profilePic: true,
				},
			},
			coverPic: true,
			comments: {
				include: {
					replies: {
						include: {
							user: {
								include: {
									profilePic: true,
								},
							},
						},
					},
					user: {
						include: {
							profilePic: true,
						},
					},
				},
			},
			materials: {
				include: {
					publication: true,
					files: true,
				},
			},
			circuit: {
				include: {
					publication: {
						include: {
							tags: true,
						},
					},
					nodes: {
						include: {
							publication: {
								include: {
									tags: true,
									materials: true,
									circuit: true,
									coverPic: true,
									publisher: {
										include: {
											profilePic: true,
										},
									},
									usedInCourse: true,
								},
							},
							next: true,
						},
					},
				},
			},
		},
	});
}

export async function getAllPublications(publishers: string[], query: string) {
	const where: any = { AND: [] };

	if (publishers.length > 0) {
		where.AND.push({ publisherId: { in: publishers } });
	}

	let publications = await prisma.publication.findMany({
		where,
		include: {
			tags: true,
			materials: true,
			circuit: true,
			coverPic: true,
			usedInCourse: {
				select: {
					course: true,
				},
			},
		},
	});

	if (query !== '') {
		const p = publications;
		const searcher = new Fuse(p, {
			keys: [
				{ name: 'title', weight: 0.4 },
				{ name: 'description', weight: 0.4 },
				{ name: 'learningObjectives', weight: 0.2 },
			],
			isCaseSensitive: false,
			threshold: 0.6,
			shouldSort: true,
		});
		publications = searcher.search(query).map((m) => m.item);
	}

	return publications;
}
