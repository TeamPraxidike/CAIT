import { describe, it, expect } from 'vitest';
import { testingUrl } from '../setup';
import { generateCourseData } from '../../utility/publicationsUtility';
import { createUniqueUser } from '../../utility/users';

// await resetTagsTable();

describe('[POST] /api/course', () => {
	it('should add a course to the database', async () => {
		const user = await createUniqueUser();
		const response = await fetch(`${testingUrl}/course`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(generateCourseData(user.id)),
		});

		expect(response.status).toBe(200);
	});

	it('should not add a courses with the same name', async () => {
		const user = await createUniqueUser();
		const courseData = generateCourseData(user.id);
		const response = await fetch(`${testingUrl}/course`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(courseData),
		});

		expect(response.status).toBe(200);

		const courseData2 = generateCourseData(user.id);
		courseData2.courseName = courseData.courseName;
		const response2 = await fetch(`${testingUrl}/course`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(courseData2),
		});
		expect(response2.status).toBe(400);
	});
});