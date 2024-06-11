import { describe, it, expect, beforeEach } from 'vitest';

import {
	createMaterialPublication,
	createUser,
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
import { Difficulty, type Material, type User } from '@prisma/client';

await resetUserTable();

describe('Creating users', () => {
	it('should increase the id by 1', async () => {
		const user = await createUser({
			firstName: 'Vasko',
			lastName: 'Prasko',
			email: 'email@gmailfdnfsdghgfd' + Math.random(),
			password: 'password',
		});
		expect(await getUserById(user.id)).toHaveProperty(
			'username',
			'VaskoPrasko',
		);

		for (let i = 2; i < 20; i++) {
			const newUser = await createUser({
				firstName: 'Vasko',
				lastName: 'Prasko',
				email: 'email@gmailadsgfahr' + i + Math.random(),
				password: 'password',
			});
			expect(await getUserById(newUser.id)).toHaveProperty(
				'username',
				'VaskoPrasko_' + i,
			);
		}
	});
});

describe('Editing users', () => {
	it('should update user reputation', async () => {
		const user = await createUser({
			firstName: 'Marti',
			lastName: 'Parti',
			email: 'email@gmailsdfgsdfgsdfg' + Math.random(),
			password: 'password',
		});

		await updateReputation(user.id, 10);

		const updatedUser = await getUserById(user.id);
		expect(updatedUser.reputation).toEqual(10);

		await updateReputation(user.id, -5);

		const updatedUser2 = await getUserById(user.id);
		expect(updatedUser2.reputation).toEqual(5);
	});

	it('should change users', async () => {
		const user = await createUser({
			firstName: 'Marti',
			lastName: 'Parti',
			email: 'email@gmailsdfgsdfgsdfg' + Math.random(),
			password: 'password',
		});

		await editUser({
			id: user.id,
			firstName: 'Kiro',
			lastName: 'Breika',
			email: 'l',
			aboutMe: "hello I am Kiro"
		});

		const editedUser = await getUserById(user.id);
		expect(editedUser).toHaveProperty('firstName', 'Kiro');
		expect(editedUser).toHaveProperty('lastName', 'Breika');
		expect(editedUser).toHaveProperty('email', 'l');

		expect(editedUser).toHaveProperty('username', 'KiroBreika');
	});
});

describe('Liking publications', () => {
	let user: User;
	let publication: Material;
	let likedMessage: string;

	beforeEach(async () => {
		user = await createUser({
			firstName: 'Marti21e1423213',
			lastName: 'Parti',
			email: 'email@gmailasdjryukryuk5' + Math.random(),
			password: 'password',
		});
		publication = await createMaterialPublication(user.id, {
			title: 'cool publication',
			description: 'This publication has description',
			copyright: true,
			difficulty: Difficulty.easy,
			learningObjectives: [],
			prerequisites: [],
			materialType: 'presentation',
			timeEstimate: 4,
			theoryPractice: 9,
		});
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
		expect(liked.liked[0].title).toBe('cool publication');
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
