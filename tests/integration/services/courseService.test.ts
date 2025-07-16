import { it, describe, expect } from 'vitest';
import { Level } from '@prisma/client';
import { createUniqueUser } from '../../utility/users';
import { generateCourseData, generateRandomString } from '../../utility/publicationsUtility';
import { createCourse } from '$lib/database/courses';

describe('Courses CRUD', () => {

	it('should add one course successfully', async () => {
		const user = await createUniqueUser();
		const courseData = generateCourseData(user.id)
		const course = await createCourse(courseData);
		expect(course).toBeDefined();
	});
});
