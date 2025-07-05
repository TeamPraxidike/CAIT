import { describe, it, expect, beforeEach } from 'vitest';

import {
	getPublicationById,
	getUserById,
	updateReputation,
} from '$lib/database';
import {
	editUser,
	getLikedPublications,
	isPublicationLiked,
	likePublication,
} from '$lib/database/user';
import { resetUserTable } from '../setup';
import { type User } from '@prisma/client';
import { createUniqueUser, createUserInputObject } from '../../utility/users';
import { createUniqueMaterial } from '../../utility/publicationsUtility';
import type { MaterialWithPublicationNoFiles } from '$lib/database/material';

await resetUserTable();

describe('Creating users', () => {
	it('should increase the id by 1', async () => {
		const user = await createUniqueUser();
		expect(await getUserById(user.id)).toHaveProperty(
			'username',
			`${user.firstName}${user.lastName}`,
		);

		for (let i = 2; i < 20; i++) {
			const newUser = await createUniqueUser(user.firstName, user.lastName);
			expect(await getUserById(newUser.id)).toHaveProperty(
				'username',
				user.username + '_' + i,
			);
		}
	});
});

describe('Editing users', () => {
	it('should update user reputation', async () => {
		const user = await createUniqueUser();

		await updateReputation(user.id, 10);

		const updatedUser = await getUserById(user.id);
		expect(updatedUser).not.toBeNull;
		expect(updatedUser!.reputation).toEqual(10);

		await updateReputation(user.id, -5);

		const updatedUser2 = await getUserById(user.id);
		expect(updatedUser2).not.toBeNull;
		expect(updatedUser2!.reputation).toEqual(5);
	});

	it('should change users', async () => {
		const user = await createUniqueUser();

		const newUserInfo = createUserInputObject();
		await editUser({
			id: user.id,
			firstName: newUserInfo.firstName,
			lastName: newUserInfo.lastName,
			email: newUserInfo.email,
			aboutMe: "I just edited myself!!!",
		});

		const editedUser = await getUserById(user.id);
		expect(editedUser).toHaveProperty('firstName', newUserInfo.firstName);
		expect(editedUser).toHaveProperty('lastName', newUserInfo.lastName);
		expect(editedUser).toHaveProperty('email', newUserInfo.email);

		expect(editedUser).toHaveProperty('username', `${newUserInfo.firstName}${newUserInfo.lastName}`);
	});
});

describe('Liking publications', () => {
	let user: User;
	let publication: MaterialWithPublicationNoFiles;
	let likedMessage: string;

	beforeEach(async () => {
		user = await createUniqueUser();
		publication = await createUniqueMaterial(user.id);
		likedMessage = await likePublication(
			user.id,
			publication.publicationId,
		);
	});

	it('should add it to the liked list', async () => {
		expect(likedMessage).toBe('Publication liked successfully');
		const liked = await getLikedPublications(user.id);
		if (liked === null) {
			throw Error('liked was null');
		}
		expect(liked.liked).toHaveLength(1);
		expect(liked.liked[0].id).toBe(publication.publicationId);
		expect(liked.liked[0].title).toBe(publication.publication.title);
	});

	it('should increase the likes value in the publication', async () => {
		const updatedPublication = await getPublicationById(
			publication.publicationId,
		);
		if (updatedPublication === null) {
			throw Error('Publication does not exist');
		}
		expect(updatedPublication.likes).toBe(1);
	});

	it('should remove it from the liked list when unliked', async () => {
		const response = await likePublication(
			user.id,
			publication.publicationId,
		);
		expect(response).toBe('Publication unliked successfully');

		const liked = await getLikedPublications(user.id);
		if (liked === null) {
			throw Error('liked was null');
		}
		expect(liked.liked.length).toBe(0);
	});

	it('should decrement the number of likes in the publication', async () => {
		await likePublication(user.id, publication.publicationId);
		const updatedPublication = await getPublicationById(
			publication.publicationId,
		);
		if (updatedPublication === null) {
			throw Error('Publication does not exist');
		}
		expect(updatedPublication.likes).toBe(0);
	});

	it('should only allow a user to like each publication once', async () => {
		for (let i = 0; i < 10; i++) {
			await likePublication(user.id, publication.publicationId);
		}
		const liked = await getLikedPublications(user.id);
		if (liked === null)
			throw new Error('Could not get liked publications list');
		expect(liked.liked.length).toBe(1);
	});

	it('should correctly a single publication as liked', async () => {
		const liked = await isPublicationLiked(
			user.id,
			publication.publicationId,
		);
		if (liked === null) {
			throw Error('liked was null');
		}
		expect(liked).toBe(true);

		await likePublication(user.id, publication.publicationId);

		const liked2 = await isPublicationLiked(
			user.id,
			publication.publicationId,
		);
		if (liked2 === null) {
			throw Error('liked was null');
		}
		expect(liked2).toBe(false);
	});
});
