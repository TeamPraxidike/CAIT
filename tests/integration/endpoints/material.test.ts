import { describe, it, expect } from 'vitest';
import { testingUrl } from '../setup';
import { Difficulty } from '@prisma/client';
import { createUser } from '$lib/database';
import { prisma } from '$lib/database';
// import {getAllMaterials, getMaterialByPublicationId, prisma} from "$lib/database";

describe('Materials', () => {
	describe('[GET] /material/:id', () => {
		it('should respond with 404 if the publication of type material does not exist', async () => {
		    const response = await fetch(`${testingUrl}/material/1`, {method: 'GET'});
		    expect(response.status).toBe(404);
		    const body = await response.json();
		    expect(body.error).toBe('Material Not Found');
		    expect(body).not.toHaveProperty('firstName');
		});

		// it('should respond with 200 if the publication of type material exists', async () => {
		// 	const response = await fetch(`${testingUrl}/material/1`, {
		// 		method: 'GET',
		// 	});
		// 	expect(response.status).toBe(200);
		// });

		it('should respond with 400 if the id is malformed', async () => {
			const response = await fetch(`${testingUrl}/material/-1`, {
				method: 'GET',
			});
			expect(response.status).toBe(400);
			const body = await response.json();
			expect(body.error).toEqual('Bad Request - Invalid ID');
			expect(body).not.toHaveProperty('id');
		});
	});
});

describe('createMaterialPublication', () => {
	it('should create a material publication with files', async () => {
		const user = await createUser('Vasko', 'Vasko', 'Vasko', 'vasko');
		const materialData = {
			title: 'Vasko and Friends',
			description: 'Vasko falls in love with Travis Scott',
			copyright: true,
			difficulty: Difficulty.easy,
			timeEstimate: 5,
			theoryPractice: 2,
			userId: user.id,
			paths: ['test.txt'],
			titles: ['test'],
		};

		const response = await fetch(`${testingUrl}/material`, {
			method: 'POST',
			body: JSON.stringify(materialData),
			headers: {
				'Content-Type': 'application/json',
			},
		});

		const responseBody = await response.json();

		expect(response.status).toBe(200);
		expect(responseBody).toHaveProperty('material');

		const file = await prisma.file.findUnique({
			where: { path: 'test.txt' },
		});
		expect(file).toHaveProperty('title', 'test');
	});
});
