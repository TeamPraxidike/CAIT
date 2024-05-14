import {describe, it, expect, beforeEach} from 'vitest';
import {testingUrl} from "../setup";
import {createUser, getUserById} from "$lib/database";
import type {userEditData} from "$lib/database";

describe('Users', () => {
	describe('[GET] /user/:id', () => {
		it('should respond with 404 if the user does not exist', async () => {
			const response = await fetch(`${testingUrl}/user/1`, {method: 'GET'});
			expect(response.status).toBe(404);
			const body = await response.json();
			expect(body.error).toBe('User not found');
			expect(body).not.toHaveProperty('firstName');
		});

		it('should respond with 200 and the user if it exists', async () => {
			const newUser =
				await createUser('ivan', 'shishman', 'ivanshishman@pliska.bg',"shishko.mp3");

			const response = await fetch(`${testingUrl}/user/${newUser.id}`, {method: 'GET'});
			expect(response.status).toBe(200);
			const body = await response.json();
			expect(body.id).toBe(newUser.id);
		});
	});

	describe('[POST] /user/', () => {
		let response : Response;
		beforeEach(async () => {
			const body = {
				firstName: 'Paisii',
				lastName: 'Hilendarski',
				email: 'paiskataH@yahoomail.com',
				profilePic: 'paiskata.jpg'
			};

			response = await fetch(`${testingUrl}/user`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(body)
			});
		})
		it('should respond with 200 and the user if it is created', async () => {
			expect(response.status).toBe(200);

			const user = (await response.json()).user;
			expect(await getUserById(user.id)).toHaveProperty('firstName', 'Paisii');
		});

		it('should respond with 500 if body is malformed', async () => {
			const body = {
				name: 'Paisii',
				lastName: 'Hilendarski',
				email: 'paiskataH@yahoomail.com',
				profilePic: 'paiskata.jpg'
			};

			response = await fetch(`${testingUrl}/user`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(body)
			});
			expect(response.status).toBe(500);
		});
	});

	describe('[DELETE] /user/:id', () => {
		let response : Response;
		beforeEach(async () => {
			const body = {
				firstName: 'Boiko',
				lastName: 'Borisov',
				email: 'KeepYourselfPositive@student.tudelft.nl',
				profilePic: 'boiko.sh'
			};

			response = await fetch(`${testingUrl}/user`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(body)
			});
		})

		it('should succesfully delete already existing users', async () => {
			const user = await response.json();
			const deleteResponse = await fetch(`${testingUrl}/user/${user.user.id}`, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json'
				}
			});
			expect(deleteResponse.status).toBe(200);
		});
	});

	describe('[PUT] /user/:id', () => {
		it('should succesfully delete already existing users', async () => {

			const body = {
				firstName: 'FirstName',
				lastName: 'LastName',
				email: 'email@student.tudelft.nl',
				profilePic: 'boiko.sh'
			};

			const newUser =
				await createUser(body.firstName, body.lastName, body.email, body.profilePic);

			const editUser : userEditData  = {
				id: newUser.id,
				firstName: 'coolName',
				lastName: 'coolLastName',
				email: 'email@student.tudelft.nl',
				profilePic: 'boiko.sh'
			};

			const response = await fetch(`${testingUrl}/user/${newUser.id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(editUser)
			});
			const user = await response.json();
			expect(response.status).toBe(200);

			expect(user).toHaveProperty("firstName", "coolName");
		});
	});
});