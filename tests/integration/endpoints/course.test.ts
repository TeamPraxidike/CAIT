import { describe, it, expect } from 'vitest';
import { testingUrl } from '../setup';
import { generateCourseData } from '../../utility/courses';
import { createUniqueUser } from '../../utility/users';
import { publicationsWithCourses } from '../../utility/courses';
import { getPublicationById } from '$lib/database';
import {
	findCourseByName,
} from '$lib/database/courses';

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

describe('[DELETE] /api/course/[courseId]', () => {
	it('should add a course to the database', async () => {
		const res = await publicationsWithCourses();
		const response = await fetch(`${testingUrl}/course/${res.course.id}`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
			}
		});

		expect(response.status).toBe(200);
		for (let i = 0; i < res.publications.length; i++) {
			const pub = res.publications[i];
			const publication = await getPublicationById(pub.publicationId);
			expect(publication.courseId).toBeNull();
		}
		const course = await findCourseByName(res.course.courseName);
		expect(course).toBeNull();
	});

});