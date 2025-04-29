import { prisma } from '$lib/database/prisma';
import { Prisma } from '@prisma/client';


export type SavedPublicationsResult = Prisma.UserGetPayload<{
	select: {
		saved: {
			include: {
				tags: true,
				materials: {
					include: {
						files: true,
					},
				},
				circuit: true,
				coverPic: true,
				usedInCourse: {
					select: {
						course: true,
					},
					where: {
						userId: string,
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
}>;
/**
 * Saves a publication for a user or unsaves it if it is already saved.
 * You dont need to expliitely check which one it is, the function does it for you
 * @param userId
 * @param publicationId
 */
export async function savePublication(userId: string, publicationId: number) {
	const saved = await getSavedPublications(userId);
	if (saved === null) throw Error('Saved publications were not found');
	if (saved.saved.map((x) => x.id).includes(publicationId)) {
		await unsave(userId, publicationId);
		return 'Publication unsaved successfully';
		// return liked.liked
	} else {
		await save(userId, publicationId);
		return 'Publication saved successfully';
	}
}

/**
 * Saves a publication for a user
 * @param userId
 * @param publicationId
 */
async function save(userId: string, publicationId: number) {
	await prisma.$transaction(async (prismaTransaction: Prisma.TransactionClient) => {
		await prismaTransaction.user.update({
			where: {
				id: userId,
			},
			data: {
				saved: {
					connect: {
						id: publicationId,
					},
				},
			},
		});
	});
}

/**
 * Unsaves a publication for a user
 * @param userId
 * @param publicationId
 */
async function unsave(userId: string, publicationId: number) {
	await prisma.$transaction(async (prismaTransaction: Prisma.TransactionClient) => {
		await prismaTransaction.user.update({
			where: {
				id: userId,
			},
			data: {
				saved: {
					disconnect: {
						id: publicationId,
					},
				},
			},
		});
	});
}

export async function getSavedPublications(userId: string): Promise<SavedPublicationsResult> {
	return prisma.user.findUnique({
		where: {
			id: userId,
		},
		select: {
			saved: {
				include: {
					tags: true,
					materials: {
						include: {
							files: true,
						},
					},
					circuit: true,
					coverPic: true,
					usedInCourse: {
						select: {
							course: true,
						},
						where: {
							userId: userId,
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

export async function isPublicationSaved(
	userId: string,
	publicationId: number,
) {
	const saved = await prisma.user.findUnique({
		where: {
			id: userId,
		},
		select: {
			saved: {
				where: {
					id: publicationId,
				},
			},
		},
	});

	if (saved === null) return false;
	return saved.saved.length > 0;
}
