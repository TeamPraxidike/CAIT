import { createUniqueUser } from './users';
import { createUniqueMaterial, generateRandomString, randomEnumValue } from './publicationsUtility';
import { createCourse, linkCourseToPublication } from '$lib/database/courses';
import type { MaterialWithPublicationNoFiles } from '$lib/database/material';
import { Level } from '@prisma/client';

export async function publicationsWithCourses(numPublications: number = 5) {
	const user = await createUniqueUser();
	const courseData = generateCourseData(user.id)
	const course = await createCourse(courseData);

	const publications: MaterialWithPublicationNoFiles[] = []
	for (let i = 0; i < numPublications; i++) {
		const material = await createUniqueMaterial(user.id);
		publications.push(material);
		await linkCourseToPublication(material.publicationId, course.id);
	}

	return {
		course,
		publications,
		user
	}
}

export function generateCourseData(creatorID: string){
	const los = Math.ceil(Math.random() * 5);
	const prerequisites = Math.ceil(Math.random() * 5);

	const learningObjectives: string[] = [];
	for (let i = 0; i < los; i++) {
		learningObjectives.push(generateRandomString(20));
	}
	const prerequisitesArray: string[] = [];
	for (let i = 0; i < prerequisites; i++) {
		prerequisitesArray.push(generateRandomString(20));
	}
	return {
		learningObjectives: learningObjectives,
		prerequisites: prerequisitesArray,
		educationalLevel: randomEnumValue(Level),
		courseName: generateRandomString(10),
		creatorId: creatorID
	};
}