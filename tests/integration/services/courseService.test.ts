import { it, describe, expect } from 'vitest';
import { Level } from '@prisma/client';
import { createUniqueUser } from '../../utility/users';
import { createUniqueMaterial, generateRandomString } from '../../utility/publicationsUtility';
import { generateCourseData } from '../../utility/courses';
import {
	createCourse, deleteCourse,
	findCourseByMantainer,
	linkCourseToPublication,
	removeCourseFromPublications
} from '$lib/database/courses';
import type { MaterialWithPublicationNoFiles } from '$lib/database/material';
import { getPublicationById } from '$lib/database';

describe('Courses CRUD', () => {

	it('should add one course successfully', async () => {
		const user = await createUniqueUser();
		const courseData = generateCourseData(user.id)
		const course = await createCourse(courseData);
		expect(course).toBeDefined();
	});

	it('should find course by mantainer', async () => {
		const user1 = await createUniqueUser();
		const user2 = await createUniqueUser();
		const courseData1 = generateCourseData(user1.id);
		const courseData2 = generateCourseData(user1.id);
		const courseData3 = generateCourseData(user2.id);
		const course1 = await createCourse(courseData1);
		const course2 = await createCourse(courseData2);
		const course3 = await createCourse(courseData3);

		const courses = await findCourseByMantainer(user1.id);
		expect(courses).toBeDefined();
		expect(courses.length).toBe(2);
		const courseNames = courses.map(course => course.courseName);
		expect(courseNames).toContain(course1.courseName);
		expect(courseNames).toContain(course2.courseName);
		expect(courseNames).not.toContain(course3.courseName);
	});

});

describe('Courses interactions with publications', () => {
	it('should link courses with publications', async () => {
		const user = await createUniqueUser();
		const courseData = generateCourseData(user.id)
		const course = await createCourse(courseData);

		const material = await createUniqueMaterial(user.id);
		await linkCourseToPublication(material.publicationId, course.id);

		const pub = await getPublicationById(material.publicationId);
		expect(pub).toBeDefined();
		expect(pub.courseId).toBe(course.id);
	});

	// TODO logic in these two tests is almost identical, consider extracting to a utility function
	it('should correctly delete a course from all publications', async () => {
		const user = await createUniqueUser();
		const courseData = generateCourseData(user.id)
		const course = await createCourse(courseData);

		const publications: MaterialWithPublicationNoFiles[] = []
		for (let i = 0; i < 5; i++) {
			const material = await createUniqueMaterial(user.id);
			publications.push(material);
			await linkCourseToPublication(material.publicationId, course.id);
		}

		await removeCourseFromPublications(course.id);

		for (let i = 0; i < publications.length; i++) {
			const pub = await getPublicationById(publications[i].publicationId);
			expect(pub).toBeDefined();
			console.log(pub);
			expect(pub.courseId).toBeNull();
		}

	});

	it('should unlink the course from other publications when deleted', async () => {
		const user = await createUniqueUser();
		const courseData = generateCourseData(user.id)
		const course = await createCourse(courseData);

		const publications: MaterialWithPublicationNoFiles[] = []
		for (let i = 0; i < 5; i++) {
			const material = await createUniqueMaterial(user.id);
			publications.push(material);
			await linkCourseToPublication(material.publicationId, course.id);
		}
		await deleteCourse(course.id);

		for (let i = 0; i < publications.length; i++) {
			const pub = await getPublicationById(publications[i].publicationId);
			expect(pub).toBeDefined();
			console.log(pub);
			expect(pub.courseId).toBeNull();
		}
	});
});
