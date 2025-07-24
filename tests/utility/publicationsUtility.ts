
// function to generate a random string of characters of length n
import { Difficulty, MaterialType } from '@prisma/client';
import { createCircuitPublication, createMaterialPublication, type MaterialForm } from '$lib/database';
import type { MaterialWithPublicationNoFiles } from '$lib/database/material';
import { expect } from 'vitest';
import { createRandomCourse } from './courses';

const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

export function generateRandomString(n: number = 20): string {
	let result = '';
	for (let i = 0; i < n; i++) {
		result += characters.charAt(Math.floor(Math.random() * characters.length));
	}
	return result;
}

export function randomEnumValue<T extends object>(e: T): T[keyof T] {
	const rand = Math.floor(Math.random() * Object.keys(e).length);
	const key = Object.keys(e)[rand] as keyof T;
	return e[key];
}

export async function createUniqueCircuit(userId: string, numNodes: number = 0) {
	const title = generateRandomString();
	const description = generateRandomString(100);
	const difficulty = randomEnumValue(Difficulty);
	const learningObjectives = [generateRandomString()];
	const prerequisites = [generateRandomString()];
	const isDraft = false;

	const inputData = {
		title,
		description,
		difficulty,
		learningObjectives,
		prerequisites,
		isDraft
	};

	return await createCircuitPublication(userId, numNodes, inputData)
}

export async function createMaterialMetaData(userId: string): Promise<MaterialForm['metaData']> {
	const title = generateRandomString();
	const description = generateRandomString(100);
	const copyright = generateRandomString(10);
	const difficulty = randomEnumValue(Difficulty);
	const learningObjectives = [generateRandomString()];
	const prerequisites = [generateRandomString()];
	const materialType = [randomEnumValue(MaterialType)];
	const timeEstimate = Math.floor(Math.random() * 10) + 1;
	const theoryPractice = Math.random();

	const course = await createRandomCourse(userId);

	return {
		title,
		description,
		copyright,
		difficulty,
		learningObjectives,
		prerequisites,
		materialType,
		timeEstimate,
		theoryPractice,
		isDraft: false,
		tags: [],
		maintainers: [],
		fileURLs: [],
		course: course.id
	};
}

export async function createMaterialData(userId: string): Promise<MaterialForm> {
	return {
		userId,
		metaData: await createMaterialMetaData(userId),
		fileDiff: {
			add: [],
			delete: [],
			edit: []
		},
		coverPic: null
	}
}

export async function createUniqueMaterial(userId: string): Promise<MaterialWithPublicationNoFiles> {
	const title = generateRandomString();
	const description = generateRandomString(100);
	const copyright = generateRandomString(10);
	const difficulty = randomEnumValue(Difficulty);
	const learningObjectives = [generateRandomString()];
	const prerequisites = [generateRandomString()];
	const materialType = [randomEnumValue(MaterialType)];
	const timeEstimate = Math.floor(Math.random() * 10) + 1;
	const theoryPractice = Math.random();

	const inputData = {
		title,
		description,
		copyright,
		difficulty,
		learningObjectives,
		prerequisites,
		materialType,
		timeEstimate,
		theoryPractice,
		isDraft: false
	}

	const publication = await createMaterialPublication(userId, inputData);

	expect(publication).toHaveProperty('publicationId');
	expect(publication.publication.title).toBe(title);
	expect(publication.publication.description).toBe(description);
	expect(publication.copyright).toBe(copyright);
	expect(publication.publication.learningObjectives).toStrictEqual(learningObjectives);
	expect(publication.publication.prerequisites).toStrictEqual(prerequisites);
	expect([publication.encapsulatingType]).toStrictEqual(materialType);
	expect(publication.publication.difficulty).toBe(difficulty);
	expect(publication.timeEstimate).toBe(timeEstimate);
	expect(publication.theoryPractice).toBeCloseTo(theoryPractice, 2);
	expect(publication.publication.isDraft).toBe(false);

	return publication;
}
