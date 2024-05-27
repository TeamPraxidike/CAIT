import { prisma } from '$lib/database';

// @ts-ignore
/**
 * Adds a new user to the database. Generates a unique username based on the user's first and last name.
 *
 * @param firstName
 * @param lastName
 * @param email
 * @param profilePic
 */
export async function createUser(
	firstName: string,
	lastName: string,
	email: string,
	profilePic: string,
) {
	const username = await generateUsername(firstName, lastName);

	return prisma.user.create({
		data: {
			firstName: firstName,
			lastName: lastName,
			username: username,
			email: email,
			profilePic: profilePic,
			isAdmin: false,
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
 */
export async function getUserById(id: number) {
	return prisma.user.findUnique({
		where: { id },
		include: {
			posts: {
				include: {
					tags: true,
				},
			},
		},
	});
}

/**
 * Deletes a user from the database
 * @param userId
 */
export async function deleteUser(userId: number) {
	return prisma.user.delete({
		where: {
			id: userId,
		},
	});
}

export type userEditData = {
	id: number;
	firstName: string;
	lastName: string;
	email: string;
	profilePic: string;
};

/**
 * Edits user information
 * @param user
 */
export async function editUser(user: userEditData) {
	return prisma.user.update({
		where: {
			id: user.id,
		},
		data: {
			firstName: user.firstName,
			lastName: user.lastName,
			email: user.email,
			profilePic: user.profilePic,
			username: await generateUsername(user.firstName, user.lastName),
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
export async function likePublication(userId: number, publicationId: number) {
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
async function like(userId: number, publicationId: number) {
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
async function unlike(userId: number, publicationId: number) {
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
export async function getLikedPublications(userId: number) {
	return prisma.user.findUnique({
		where: {
			id: userId,
		},
		select: {
			liked: true,
		}
	});
}

export async function isPublicationLiked(userId: number, publicationId: number) {
	const liked = await prisma.user.findUnique({
		where: {
			id: userId
		},
		select: {
			liked: {
				where: {
					id: publicationId
				}
			}
		}
	});

	if(liked === null) return false;
	return liked.liked.length > 0;
}
