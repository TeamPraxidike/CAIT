import { prisma } from '$lib/database';
import { Prisma } from '@prisma/client/extension';

/**
 * Adds a new user to the database. Generates a unique username based on the user's first and last name.
 *
 * @param data
 * @param prismaContext
 */
export async function createUser(
	data: {
		firstName: string;
		lastName: string;
		email: string;
		password: string;
	},
	prismaContext: Prisma.TransactionClient = prisma,
) {
	const username = await generateUsername(data.firstName, data.lastName);

	return prismaContext.user.create({
		data: {
			firstName: data.firstName,
			lastName: data.lastName,
			username: username,
			email: data.email,
			isAdmin: false,
			password: data.password,
		},
	});
}

/**
 * Generates a unique username
 *
 * The way the username is generated is the following:
 * If the there is no other user with the same first and last name, the username is the concatenation of the first and last name.
 * If there are other users with the same first and last name, the username is the concatenation of the first and last name concatenated with an underscore and a number.
 * This number is the maximum number that someone with the same first and last name has in their username plus 1.
 * So for example the first Vasko Guenov I add would have a username VaskoGuenov, the second would have VaskoGuenov_2, the third VaskoGuenov_3 and so on.
 * This ensures that if I delete user VaskoGuenov_2, the next user with the same name would be VaskoGuenov_4. I did not see a point in having
 * complex logic to take up the smallest number available.
 *
 * @param firstName
 * @param lastName
 */
async function generateUsername(firstName: string, lastName: string) {
	const users = await prisma.user.findMany({
		where: {
			firstName: firstName,
			lastName: lastName,
		},
	});

	let maxNumber: number = users.length > 0 ? 1 : 0;

	users.forEach((user) => {
		const num = parseInt(user.username.split('_')[1]);
		if (!isNaN(num) && num > maxNumber) {
			maxNumber = num;
		}
	});

	let username: string;
	if (maxNumber == 0) {
		username = firstName + lastName;
	} else {
		username = firstName + lastName + '_' + (maxNumber + 1);
	}
	return username;
}

/**
 * Returns the user with the given id.
 * @param id
 * @param prismaContext
 */
export async function getUserById(
	id: string,
	prismaContext: Prisma.TransactionClient = prisma,
) {
	return prismaContext.user.findUnique({
		where: { id },
		include: {
			posts: {
				include: {
					tags: true,
					usedInCourse: {
						select: {
							course: true,
						},
					},
				},
			},
			profilePic: true,
		},
	});
}

export async function getUserByEmail(
	email: string,
	prismaContext: Prisma.TransactionClient = prisma,
) {
	return prismaContext.user.findUnique({
		where: { email },
		include: {
			posts: {
				include: {
					tags: true,
				},
			},
			profilePic: true,
		},
	});
}

/**
 * Deletes a user from the database
 * @param userId
 * @param prismaContext
 */
export async function deleteUser(
	userId: string,
	prismaContext: Prisma.TransactionClient = prisma,
) {
	return await prismaContext.user.delete({
		where: {
			id: userId,
		},
		include: {
			profilePic: true,
		},
	});
}

export type userEditData = {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	aboutMe: string;
};

/**
 * Edits user information
 * @param user
 * @param prismaContext
 */
export async function editUser(
	user: userEditData,
	prismaContext: Prisma.TransactionClient = prisma,
) {
	return prismaContext.user.update({
		where: {
			id: user.id,
		},
		data: {
			firstName: user.firstName,
			lastName: user.lastName,
			email: user.email,
			username: await generateUsername(user.firstName, user.lastName),
			aboutMe: user.aboutMe,
		},
	});
}

/**
 * Increases the reputation with number amount of points of the user with id userId
 * @param userId - the id of the user receiving points
 * @param number - the reputation points to be added
 * @param prismaContext
 */

export async function updateReputation(
	userId: string,
	number: number,
	prismaContext: Prisma.TransactionClient = prisma,
) {
	return prismaContext.user.update({
		where: {
			id: userId,
		},
		data: {
			reputation: {
				increment: number,
			},
		},
	});
}

/**
 * Used to like/unlike a publication
 * Checks whether the user has already liked it and does the right action based on that (like or unlike)
 *
 * @param userId
 * @param publicationId
 */
export async function likePublication(userId: string, publicationId: number) {
	const liked = await getLikedPublications(userId);
	if (liked === null) throw Error('Liked publications were not found');
	if (liked.liked.map((x) => x.id).includes(publicationId)) {
		await unlike(userId, publicationId);
		return 'Publication unliked successfully';
		// return liked.liked
	} else {
		await like(userId, publicationId);
		return 'Publication liked successfully';
	}
}

/**
 * Method for liking a publication, adds it to the user's liked and increases the counter in the publication atomically
 * Does not check whether the user has already liked it, so should not be used just by itself
 *
 * @param userId
 * @param publicationId
 */
async function like(userId: string, publicationId: number) {
	await prisma.$transaction(async (prismaTransaction) => {
		await prismaTransaction.user.update({
			where: {
				id: userId,
			},
			data: {
				liked: {
					connect: {
						id: publicationId,
					},
				},
			},
		});
		await prismaTransaction.publication.update({
			where: {
				id: publicationId,
			},
			data: {
				likes: {
					increment: 1,
				},
			},
		});
	});
}

/**
 * Method for unliking a publication, removes it from the user's liked and decreases the counter in the publication atomically
 * Does not check whether the user has already liked it, so should not be used just by itself
 *
 * @param userId
 * @param publicationId
 */
async function unlike(userId: string, publicationId: number) {
	await prisma.$transaction(async (prismaTransaction) => {
		await prismaTransaction.user.update({
			where: {
				id: userId,
			},
			data: {
				liked: {
					disconnect: {
						id: publicationId,
					},
				},
			},
		});
		await prismaTransaction.publication.update({
			where: {
				id: publicationId,
			},
			data: {
				likes: {
					decrement: 1,
				},
			},
		});
	});
}

/**
 * returns a list with all liked publications of a user
 * @param userId
 */
export async function getLikedPublications(userId: string) {
	return prisma.user.findUnique({
		where: {
			id: userId,
		},
		select: {
			liked: true,
		},
	});
}

export async function isPublicationLiked(
	userId: string,
	publicationId: number,
) {
	const liked = await prisma.user.findUnique({
		where: {
			id: userId,
		},
		select: {
			liked: {
				where: {
					id: publicationId,
				},
			},
		},
	});

	if (liked === null) return false;
	return liked.liked.length > 0;
}

/**
 * Used to like/unlike a comment
 * Checks whether the user has already liked it and does the right action based on that (like or unlike)
 *
 * @param userId
 * @param commentId
 */
export async function likesCommentUpdate(userId: string, commentId: number) {
	const liked = await getLikedComments(userId);
	if (liked === null) throw Error('Liked comment were not found');
	if (liked.likedComments.map((x) => x.id).includes(commentId)) {
		await unlikeComment(userId, commentId);
		return 'Comment unliked successfully';
		// return liked.liked
	} else {
		await likeComment(userId, commentId);
		return 'Comment liked successfully';
	}
}

/**
 * Method for liking a comment, adds it to the user's likedComments and increases the counter in the comment atomically
 * Does not check whether the user has already liked it, so should not be used just by itself
 *
 * @param userId
 * @param commentId
 */
async function likeComment(userId: string, commentId: number) {
	await prisma.$transaction(async (prismaTransaction) => {
		await prismaTransaction.user.update({
			where: {
				id: userId,
			},
			data: {
				likedComments: {
					connect: {
						id: commentId,
					},
				},
			},
		});
		await prismaTransaction.comment.update({
			where: {
				id: commentId,
			},
			data: {
				likes: {
					increment: 1,
				},
			},
		});
	});
}

/**
 * Method for unliking a comment, removes it from the user's likedComments and decreases the counter in the comment atomically
 * Does not check whether the user has already liked it, so should not be used just by itself
 *
 * @param userId
 * @param commentId
 */
async function unlikeComment(userId: string, commentId: number) {
	await prisma.$transaction(async (prismaTransaction) => {
		await prismaTransaction.user.update({
			where: {
				id: userId,
			},
			data: {
				likedComments: {
					disconnect: {
						id: commentId,
					},
				},
			},
		});
		await prismaTransaction.comment.update({
			where: {
				id: commentId,
			},
			data: {
				likes: {
					decrement: 1,
				},
			},
		});
	});
}

/**
 * returns a list with all liked comment of a user
 * @param userId
 */
export async function getLikedComments(userId: string) {
	return prisma.user.findUnique({
		where: {
			id: userId,
		},
		select: {
			likedComments: true,
		},
	});
}

/**
 * Used to like/unlike a reply
 * Checks whether the user has already liked it and does the right action based on that (like or unlike)
 *
 * @param userId
 * @param replyId
 */
export async function likesReplyUpdate(userId: string, replyId: number) {
	const liked = await getLikedReplies(userId);
	if (liked === null) throw Error('Liked reply were not found');
	if (liked.likedReplies.map((x) => x.id).includes(replyId)) {
		await unlikeReply(userId, replyId);
		return 'Reply unliked successfully';
		// return liked.liked
	} else {
		await likeReply(userId, replyId);
		return 'Reply liked successfully';
	}
}

/**
 * Method for liking a reply, adds it to the user's likedReplies and increases the counter in the reply atomically
 * Does not check whether the user has already liked it, so should not be used just by itself
 *
 * @param userId
 * @param replyId
 */
async function likeReply(userId: string, replyId: number) {
	await prisma.$transaction(async (prismaTransaction) => {
		await prismaTransaction.user.update({
			where: {
				id: userId,
			},
			data: {
				likedReplies: {
					connect: {
						id: replyId,
					},
				},
			},
		});
		await prismaTransaction.reply.update({
			where: {
				id: replyId,
			},
			data: {
				likes: {
					increment: 1,
				},
			},
		});
	});
}

/**
 * Method for unliking a reply, removes it from the user's likedReplies and decreases the counter in the reply atomically
 * Does not check whether the user has already liked it, so should not be used just by itself
 *
 * @param userId
 * @param replyId
 */
async function unlikeReply(userId: string, replyId: number) {
	await prisma.$transaction(async (prismaTransaction) => {
		await prismaTransaction.user.update({
			where: {
				id: userId,
			},
			data: {
				likedReplies: {
					disconnect: {
						id: replyId,
					},
				},
			},
		});
		await prismaTransaction.reply.update({
			where: {
				id: replyId,
			},
			data: {
				likes: {
					decrement: 1,
				},
			},
		});
	});
}

/**
 * returns a list with all liked reply of a user
 * @param userId
 */
export async function getLikedReplies(userId: string) {
	return prisma.user.findUnique({
		where: {
			id: userId,
		},
		select: {
			likedReplies: true,
		},
	});
}
