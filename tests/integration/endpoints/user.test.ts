import {describe, it, expect, beforeEach} from 'vitest';
import {testingUrl} from "../setup";
import {
	createMaterialPublication,
	createUser,
	getUserById,
	prisma,
	type userEditData
} from "$lib/database";
import {Difficulty} from "@prisma/client";

//await resetUserTable();

async function getExistingUserIDs() {
	const users = await prisma.user.findMany({
		select: {
			id: true,
		},
	});
	return users.map(user => user.id);
}

function generateRandomID() {
	return Math.floor(Math.random() * 1000000); // Adjust the range as needed
}

describe('Users', () => {
    describe('[GET] /user/:id', () => {
        it('should respond with 404 if the user does not exist', async () => {
			const userIds: number[] = await getExistingUserIDs();

			let randomID;
			do {
				randomID = generateRandomID();
			} while (userIds.includes(randomID));

            const response = await fetch(`${testingUrl}/user/${randomID}`, {method: 'GET'});
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

	describe('[GET] /user/:id/liked', () => {
		it("should return an empty list for a newly created user", async () => {
			const user =
				await createUser("Halil", "uisnfgkfvm", "email@gmail", "picture.picture");

			const response = await fetch(`${testingUrl}/user/${user.id}/liked`);
			expect(response.status).toBe(204);
		});

		it("should return 404 when user does not exist", async () => {
			const response = await fetch(`${testingUrl}/user/${9848906}/liked`);
			expect(response.status).toBe(404);
		});

		// it("should return a list with liked posts as content", async () => {
		// 	const user =
		// 		await createUser("Halil", "uisnfgkfvm", "email@gmail", "picture.picture");
		// 	const publication = await createMaterialPublication({
		// 		userId: user.id,
		// 		title: "cool publication 2",
		// 		description: "This publication has description",
		// 		copyright: true,
		// 		difficulty: Difficulty.easy
		// 	});
		//
		// 	await fetch(`${testingUrl}/user/${user.id}/liked/${publication.publicationId}`, {
		// 		method: 'POST',
		// 	});
		//
		// 	const response = await fetch(`${testingUrl}/user/${user.id}/liked`);
		//
		// 	const responseBody = await response.json();
		//
		// 	expect(responseBody).toHaveLength(1);
		// 	expect(responseBody[0].id).toBe(publication.publicationId);
		//
		// 	const publication2 = await createMaterialPublication({
		// 		userId: user.id,
		// 		title: "cool publication 2",
		// 		description: "This publication has description",
		// 		copyright: true,
		// 		difficulty: Difficulty.easy
		// 	});
		//
		// 	await fetch(`${testingUrl}/user/${user.id}/liked/${publication2.publicationId}`, {
		// 		method: 'POST',
		// 	});
		// 	const response2 = await fetch(`${testingUrl}/user/${user.id}/liked`);
		// 	const responseBody2 = await response2.json();
		// 	expect(responseBody2).toHaveLength(2);
		// 	expect(responseBody2[0].id).toBe(publication.publicationId);
		// 	expect(responseBody2[1].id).toBe(publication2.publicationId);
		// });
	});

	describe('[POST] /user/:id/liked/:publicationId', () => {
		// it('should successfully like a publication', async () => {
		// 	const body = {
		// 		firstName: 'Kirilcho',
		// 		lastName: 'Panayotov',
		// 		email: 'email@student.tudelft.nl',
		// 		profilePic: 'image.jpg'
		// 	};
		// 	const user =
		// 		await createUser(body.firstName, body.lastName, body.email, body.profilePic);
		//
		// 	const publication = await createMaterialPublication({
		// 		userId: user.id,
		// 		title: "cool publication 2",
		// 		description: "This publication has description",
		// 		copyright: true,
		// 		difficulty: Difficulty.easy
		// 	});
		//
		// 	const response = await fetch(`${testingUrl}/user/${user.id}/liked/${publication.publicationId}`, {
		// 		method: 'POST',
		// 	});
		//
		// 	const responseBody = await response.json();
		// 	expect(response.status).toBe(200);
		// 	expect(responseBody.message).toBe("Publication liked successfully");
		//
		// 	const response2 = await fetch(`${testingUrl}/user/${user.id}/liked/${publication.publicationId}`, {
		// 		method: 'POST',
		// 	});
		//
		// 	const responseBody2 = await response2.json();
		// 	expect(response2.status).toBe(200);
		// 	expect(responseBody2.message).toBe("Publication unliked successfully");
		// });

		it('should return 404 when user does not exist', async () => {
			const response = await fetch(`${testingUrl}/user/${830957945}/liked/${34567890}`, {
				method: 'POST',
			});
			expect(response.status).toBe(404);
			const responseBody = await response.json();
			expect(responseBody.error).toBe("User not found");
		});

		it('should return 404 when publication does not exist', async () => {
			const body = {
				firstName: 'Kirilcho',
				lastName: 'Panayotov',
				email: 'email@student.tudelft.nl',
				profilePic: 'image.jpg'
			};
			const user =
				await createUser(body.firstName, body.lastName, body.email, body.profilePic);

			const response = await fetch(`${testingUrl}/user/${user.id}/liked/${34567890}`, {
				method: 'POST',
			});
			expect(response.status).toBe(404);
			const responseBody = await response.json();
			expect(responseBody.error).toBe("Publication not found");
		});
	});

	describe('[GET] /user/:id/saved', () => {
		it("should return an empty list for a newly created user", async () => {
			const user =
				await createUser("Ivan", "uisnfgkfvm", "email@gmail", "picture.picture");

			const response = await fetch(`${testingUrl}/user/${user.id}/saved`);
			expect(response.status).toBe(204);
		});

		it("should return 404 when user does not exist", async () => {
			const response = await fetch(`${testingUrl}/user/${9848906}/saved`);
			expect(response.status).toBe(404);
		});

		it("should return a list with liked posts as content", async () => {
			const user =
				await createUser("Halil", "uisnfgkfvm", "email@gmail", "picture.picture");
			const publication = await createMaterialPublication(
				user.id,
				{
					title: "cool publication",
					description: "This publication has description",
					difficulty: Difficulty.easy,
					coverPic: 'cover',
					copyright: true,
					timeEstimate: 4,
					theoryPractice: 9,
					learningObjectives: [],
					prerequisites: []
				}
			);

			await fetch(`${testingUrl}/user/${user.id}/saved/${publication.publicationId}`, {
				method: 'POST',
			});

			const response = await fetch(`${testingUrl}/user/${user.id}/saved`);

			const responseBody = await response.json();

			expect(responseBody).toHaveLength(1);
			expect(responseBody[0].id).toBe(publication.publicationId);

			const publication2 = await createMaterialPublication(
				user.id,
				{
					title: "cool publication",
					description: "This publication has description",
					difficulty: Difficulty.easy,
					coverPic: 'cover',
					copyright: true,
					timeEstimate: 4,
					theoryPractice: 9,
					learningObjectives: [],
					prerequisites: []
				}
			);

			await fetch(`${testingUrl}/user/${user.id}/saved/${publication2.publicationId}`, {
				method: 'POST',
			});
			const response2 = await fetch(`${testingUrl}/user/${user.id}/saved`);
			const responseBody2 = await response2.json();
			expect(responseBody2).toHaveLength(2);
			expect(responseBody2[0].id).toBe(publication.publicationId);
			expect(responseBody2[1].id).toBe(publication2.publicationId);
		});
	});

	describe('[POST] /user/:id/saved/:publicationId', () => {
		it('should successfully save a publication', async () => {
			const body = {
				firstName: 'Kirilcho',
				lastName: 'Panayotov',
				email: 'email@student.tudelft.nl',
				profilePic: 'image.jpg'
			};
			const user =
				await createUser(body.firstName, body.lastName, body.email, body.profilePic);

			const publication = await createMaterialPublication(
				user.id,
				{
					title: "cool publication",
					description: "This publication has description",
					difficulty: Difficulty.easy,
					coverPic: 'cover',
					copyright: true,
					timeEstimate: 4,
					theoryPractice: 9,
					learningObjectives: [],
					prerequisites: []
				}
			);

			const response = await fetch(`${testingUrl}/user/${user.id}/saved/${publication.publicationId}`, {
				method: 'POST',
			});

			const responseBody = await response.json();
			expect(response.status).toBe(200);
			expect(responseBody.message).toBe("Publication saved successfully");

			const response2 = await fetch(`${testingUrl}/user/${user.id}/saved/${publication.publicationId}`, {
				method: 'POST',
			});

			const responseBody2 = await response2.json();
			expect(response2.status).toBe(200);
			expect(responseBody2.message).toBe("Publication unsaved successfully");
		});

		it('should return 404 when user does not exist', async () => {
			const response = await fetch(`${testingUrl}/user/${830957945}/saved/${34567890}`, {
				method: 'POST',
			});
			expect(response.status).toBe(404);
			const responseBody = await response.json();
			expect(responseBody.error).toBe("User not found");
		});

		it('should return 404 when publication does not exist', async () => {
			const body = {
				firstName: 'Kirilcho',
				lastName: 'Panayotov',
				email: 'email@student.tudelft.nl',
				profilePic: 'image.jpg'
			};
			const user =
				await createUser(body.firstName, body.lastName, body.email, body.profilePic);

			const response = await fetch(`${testingUrl}/user/${user.id}/saved/${34567890}`, {
				method: 'POST',
			});
			expect(response.status).toBe(404);
			const responseBody = await response.json();
			expect(responseBody.error).toBe("Publication not found");
		});
	});
});