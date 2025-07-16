import { it, describe, expect } from 'vitest';
import { Level } from '@prisma/client';
import { createUniqueUser } from '../../utility/users';
import { generateRandomString } from '../../utility/publicationsUtility';
import { createCourse } from '$lib/database/courses';

describe('Courses CRUD', () => {

	it('should add one course successfully', async () => {
		const user = await createUniqueUser();
		const courseData = {
			learningObjectives: ['Understand the basics of programming'],
			prerequisites: ['Basic math skills'],
			educationalLevel: Level.PhD,
			courseName: generateRandomString(),
			creatorId: user.id
		}

		const course = await createCourse(courseData);
		expect(course).toBeDefined();
	});

});
