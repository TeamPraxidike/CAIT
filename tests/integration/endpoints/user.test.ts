import { describe, it, expect, beforeEach } from 'vitest';
import { testingUrl } from '../setup';
import {
	createMaterialPublication,
	createUser, getUserById,
	likePublication,
	prisma,
	savePublication
} from '$lib/database';
import { Difficulty, Prisma } from '@prisma/client';
import { createUniqueMaterial, generateRandomString } from '../../utility/publicationsUtility';
import { uuid } from '@supabase/supabase-js/dist/main/lib/helpers';
import { createUniqueUser, createUserInputObject, type UserInput } from '../../utility/users';

//await resetUserTable();

async function getExistingUserIDs() {
	const users: Prisma.UserGetPayload<true>[] = await prisma.user.findMany({
		select: {
			id: true,
		},
	});
	return users.map((user) => user.id);
}

describe('Users', () => {
	describe('[GET] /user/:id', () => {
		it('should respond with 404 if the user does not exist', async () => {
			const userIds: string[] = await getExistingUserIDs();

			let randomID: string;
			do {
				randomID = uuid();
			} while (userIds.includes(randomID));

			const response = await fetch(`${testingUrl}/user/${randomID}`, {
				method: 'GET',
			});
			console.log(response);
			expect(response.status).toBe(404);
			const body = await response.json();
			expect(body.error).toBe('User not found');
			expect(body).not.toHaveProperty('firstName');
		});

		it('should respond with 200 and the user if it exists', async () => {
			const newUser = await createUniqueUser();
			const response = await fetch(`${testingUrl}/user/${newUser.id}`, {
				method: 'GET',
			});
			expect(response.status).toBe(200);
			const body = await response.json();
			expect(body.user.id).toBe(newUser.id);
		});
	});

	describe('[POST] /user/', () => {
		let response: Response;
		let userInput: { metaData: UserInput };
		beforeEach(async () => {
			userInput = { metaData: createUserInputObject() };

			response = await fetch(`${testingUrl}/user`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(userInput),
			});
		});

		it('should respond with 200 and the user if it is created', async () => {
			expect(response.status).toBe(200);

			const user = (await response.json()).user;
			expect(await getUserById(user.id)).toHaveProperty(
				'firstName',
				user.firstName,
			);
		});

		it('should respond with 500 if body is malformed', async () => {
			const body = createUserInputObject();

			response = await fetch(`${testingUrl}/user`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(body),
			});
			expect(response.status).toBe(500);
		});
	});

	describe('[DELETE] /user/:id', () => {
		let response: Response;
		beforeEach(async () => {
			const body = {metaData: createUserInputObject()}

			response = await fetch(`${testingUrl}/user`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(body),
			});
		});

		it('should succesfully delete already existing users', async () => {
			const user = await response.json();
			const deleteResponse = await fetch(
				`${testingUrl}/user/${user.user.id}`,
				{
					method: 'DELETE',
					headers: {
						'Content-Type': 'application/json',
					},
				},
			);
			expect(deleteResponse.status).toBe(200);
		});
	});

	describe('[PUT] /user/:id', () => {
		it('should succesfully edit already existing users', async () => {
			const newUser = await createUniqueUser();

			const editUser = { metaData: { ...createUserInputObject(), aboutMe: "This is a test user" }, profilePic: null };
			const response = await fetch(`${testingUrl}/user/${newUser.id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(editUser),
			});
			const user = await response.json();
			expect(response.status).toBe(200);

			expect(user).toHaveProperty('firstName', editUser.metaData.firstName);
		});
	});

	describe('[GET] /user/:id/liked', () => {
		it('should return an empty list for a newly created user', async () => {
			const user = await createUniqueUser();

			const response = await fetch(`${testingUrl}/user/${user.id}/liked`);
			expect(response.status).toBe(204);
		});

		it('should return 404 when user does not exist', async () => {
			const response = await fetch(
				`${testingUrl}/user/${uuid()}/liked`,
			);
			expect(response.status).toBe(404);
		});

		it('should return a list with liked posts as content', async () => {
			const user = await createUniqueUser()
			const publication = await createUniqueMaterial(user.id);

			await fetch(
				`${testingUrl}/user/${user.id}/liked/${publication.publicationId}`,
				{
					method: 'POST',
				},
			);

			const response = await fetch(`${testingUrl}/user/${user.id}/liked`);

			const responseBody = await response.json();

			expect(responseBody).toHaveLength(1);
			expect(responseBody[0]).toBe(publication.publicationId);

			const publication2 = await createUniqueMaterial(user.id);

			await fetch(
				`${testingUrl}/user/${user.id}/liked/${publication2.publicationId}`,
				{
					method: 'POST',
				},
			);
			const response2 = await fetch(
				`${testingUrl}/user/${user.id}/liked`,
			);
			const responseBody2 = await response2.json();
			expect(responseBody2).toHaveLength(2);
			expect(responseBody2[0]).toBe(publication.publicationId);
			expect(responseBody2[1]).toBe(publication2.publicationId);
		});
	});

	describe('[POST] /user/:id/liked/:publicationId', () => {
		it('should successfully like a publication', async () => {
			const user = await createUniqueUser();
			const publication = await createUniqueMaterial(user.id);

			const response = await fetch(
				`${testingUrl}/user/${user.id}/liked/${publication.publicationId}`,
				{
					method: 'POST',
				},
			);

			const responseBody = await response.json();
			expect(response.status).toBe(200);
			expect(responseBody.message).toBe('Publication liked successfully');

			const likedRes = await fetch(
				`${testingUrl}/user/${user.id}/liked/${publication.publicationId}`,
			);
			expect(await likedRes.json()).toBe(true);

			const response2 = await fetch(
				`${testingUrl}/user/${user.id}/liked/${publication.publicationId}`,
				{
					method: 'POST',
				},
			);

			const responseBody2 = await response2.json();
			expect(response2.status).toBe(200);
			expect(responseBody2.message).toBe(
				'Publication unliked successfully',
			);

			const likedRes2 = await fetch(
				`${testingUrl}/user/${user.id}/liked/${publication.publicationId}`,
			);
			expect(await likedRes2.json()).toBe(false);
		});

		it('should return 404 when user does not exist', async () => {
			const response = await fetch(
				`${testingUrl}/user/${uuid()}/liked/${34567890}`,
				{
					method: 'POST',
				},
			);
			expect(response.status).toBe(404);
			const responseBody = await response.json();
			expect(responseBody.error).toBe('User not found');
		});

		it('should return 404 when publication does not exist', async () => {
			const user = await createUniqueUser();

			const response = await fetch(
				`${testingUrl}/user/${user.id}/liked/${34567890}`,
				{
					method: 'POST',
				},
			);
			expect(response.status).toBe(404);
			const responseBody = await response.json();
			expect(responseBody.error).toBe('Publication not found');
		});
	});

	describe('[GET] /user/:id/liked/:publicationId', () => {
		it('should return 404 when user does not exist', async () => {
			const response = await fetch(
				`${testingUrl}/user/${uuid()}/liked/${34567890}`,
			);
			expect(response.status).toBe(404);
			const responseBody = await response.json();
			expect(responseBody.error).toBe('User not found');
		});

		it('should return 404 when publication does not exist', async () => {
			const user = await createUniqueUser();

			const response = await fetch(
				`${testingUrl}/user/${user.id}/liked/${34567890}`,
			);
			expect(response.status).toBe(404);
			const responseBody = await response.json();
			expect(responseBody.error).toBe('Publication not found');
		});
	});

	describe('[GET] /user/:id/saved', () => {
		it('should return an empty list for a newly created user', async () => {
			const user = await createUniqueUser();

			const response = await fetch(`${testingUrl}/user/${user.id}/saved`);
			expect(response.status).toBe(204);
		});

		it('should return 404 when user does not exist', async () => {
			const response = await fetch(`${testingUrl}/user/${uuid()}/saved`);
			expect(response.status).toBe(404);
		});

		it('should return a list with liked posts as content', async () => {
			const user = await createUniqueUser();
			const publication = await createUniqueMaterial(user.id);

			await fetch(
				`${testingUrl}/user/${user.id}/saved/${publication.publicationId}`,
				{
					method: 'POST',
				},
			);

			const response = await fetch(`${testingUrl}/user/${user.id}/saved`);
			const responseBody = await response.json();

			expect(responseBody.saved).toHaveLength(1);
			expect(responseBody.saved[0]).toBe(publication.publicationId);

			const publication2 = await createUniqueMaterial(user.id);

			await fetch(
				`${testingUrl}/user/${user.id}/saved/${publication2.publicationId}`,
				{
					method: 'POST',
				},
			);
			const response2 = await fetch(
				`${testingUrl}/user/${user.id}/saved`,
			);
			const responseBody2 = await response2.json();
			expect(responseBody2.saved).toHaveLength(2);
			expect(responseBody2.saved).toContain(publication.publicationId);
			expect(responseBody2.saved).toContain(publication2.publicationId);
		});
	});

	describe('[POST] /user/:id/saved/:publicationId', () => {
		it('should successfully save a publication', async () => {
			const user = await createUniqueUser();

			const publication = await createUniqueMaterial(user.id);

			const response = await fetch(
				`${testingUrl}/user/${user.id}/saved/${publication.publicationId}`,
				{
					method: 'POST',
				},
			);

			const responseBody = await response.json();
			expect(response.status).toBe(200);
			expect(responseBody.message).toBe('Publication saved successfully');

			const response2 = await fetch(
				`${testingUrl}/user/${user.id}/saved/${publication.publicationId}`,
				{
					method: 'POST',
				},
			);

			const responseBody2 = await response2.json();
			expect(response2.status).toBe(200);
			expect(responseBody2.message).toBe(
				'Publication unsaved successfully',
			);
		});

		it('should return 404 when user does not exist', async () => {
			const response = await fetch(
				`${testingUrl}/user/${uuid()}/saved/${34567890}`,
				{
					method: 'POST',
				},
			);
			expect(response.status).toBe(404);
			const responseBody = await response.json();
			expect(responseBody.error).toBe('User not found');
		});

		it('should return 404 when publication does not exist', async () => {
			const user = await createUniqueUser();

			const response = await fetch(
				`${testingUrl}/user/${user.id}/saved/${34567890}`,
				{
					method: 'POST',
				},
			);
			expect(response.status).toBe(404);
			const responseBody = await response.json();
			expect(responseBody.error).toBe('Publication not found');
		});
	});

	describe('[GET] user/[id]/publicationInfo/[publicationId]', async () => {
		it('should correctly return saved and liked', async () => {
			const user = await createUniqueUser();
			const publication = await createUniqueMaterial(user.id);

			const response1 = await fetch(
				`${testingUrl}/user/${user.id}/publicationInfo/${publication.publicationId}`,
			);
			const info1 = await response1.json();

			expect(info1.saved).toBe(false);
			expect(info1.liked).toBe(false);

			await likePublication(user.id, publication.publicationId);
			await savePublication(user.id, publication.publicationId);

			const response2 = await fetch(
				`${testingUrl}/user/${user.id}/publicationInfo/${publication.publicationId}`,
			);
			const info2 = await response2.json();

			expect(info2.saved).toBe(true);
			expect(info2.liked).toBe(true);
		});

		it('should return 404 when user does not exist', async () => {
			const response1 = await fetch(
				`${testingUrl}/user/${uuid()}/publicationInfo/${7747474}`,
			);
			expect(response1.status).toBe(404);
		});

		it('should return 404 when publication does not exist', async () => {
			const user = await createUniqueUser();

			const response1 = await fetch(
				`${testingUrl}/user/${user.id}/publicationInfo/${7747474}`,
			);
			expect(response1.status).toBe(404);
		});
	});
});
