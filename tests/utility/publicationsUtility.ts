
// function to generate a random string of characters of length n
import { Difficulty, MaterialType } from '@prisma/client';
import { createMaterialPublication } from '$lib/database';
import type { MaterialWithPublicationNoFiles } from '$lib/database/material';

function generateRandomString(n: number = 20): string {
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let result = '';
	for (let i = 0; i < n; i++) {
		result += characters.charAt(Math.floor(Math.random() * characters.length));
	}
	return result;
}

function randomEnumValue<T extends object>(e: T): T[keyof T] {
	const rand = Math.floor(Math.random() * Object.keys(e).length);
	const key = Object.keys(e)[rand] as keyof T;
	return e[key];
}

export async function createUniquePublication(userId: string): Promise<MaterialWithPublicationNoFiles> {
	const title = generateRandomString();
	const description = generateRandomString(100);

	const inputData = {
		title,
		description,
		copyright: "true",
		difficulty: randomEnumValue(Difficulty),
		learningObjectives: [generateRandomString()],
		prerequisites: [generateRandomString()],
		materialType: [randomEnumValue(MaterialType)],
		timeEstimate: 4,
		theoryPractice: 9,
		isDraft: false
	}

	return await createMaterialPublication(userId, inputData);
}