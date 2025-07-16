import { it, describe, expect } from 'vitest';
import { Level } from '@prisma/client';
import { createUniqueUser } from '../../utility/users';
import { generateCourseData, generateRandomString } from '../../utility/publicationsUtility';
import { createCourse, findCourseByMantainer } from '$lib/database/courses';

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
