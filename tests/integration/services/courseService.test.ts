import { it, describe, expect } from 'vitest';
import { createUniqueUser } from '../../utility/users';
import { createUniqueMaterial } from '../../utility/publicationsUtility';
import { createMaterialsWithCourses, createRandomCourse } from '../../utility/courses';
import { deleteCourse,
	findCourseByMantainer,
	linkCourseToPublication, removeCourseFromPublication,
	removeCourseFromPublications
} from '$lib/database/courses';
import { getPublicationById } from '$lib/database';

describe('Courses CRUD', () => {

	it('should add one course successfully', async () => {
		const user = await createUniqueUser();
		const course = await createRandomCourse(user.id);
		expect(course).toBeDefined();
	});

	it('should find course by mantainer', async () => {
		const user1 = await createUniqueUser();
		const user2 = await createUniqueUser();
		const course1 = await createRandomCourse(user1.id);
		const course2 = await createRandomCourse(user1.id);
		const course3 = await createRandomCourse(user2.id);

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
		const course = await createRandomCourse(user.id);

		const material = await createUniqueMaterial(user.id);
		await linkCourseToPublication(material.publicationId, course.id);

		const pub = await getPublicationById(material.publicationId);
		expect(pub).toBeDefined();
		expect(pub.courseId).toBe(course.id);
	});

	// TODO logic in these two tests is almost identical, consider extracting to a utility function
	it('should correctly delete a course from all publications', async () => {
		const user = await createUniqueUser();
		const course = await createRandomCourse(user.id);

		const publications = await createMaterialsWithCourses(user.id, course.id);
		await removeCourseFromPublications(course.id);

		for (let i = 0; i < publications.length; i++) {
			const pub = await getPublicationById(publications[i].publicationId);
			expect(pub).toBeDefined();
			expect(pub.courseId).toBeNull();
		}

	});

	it('should unlink the course from other publications when deleted', async () => {
		const user = await createUniqueUser();
		const course = await createRandomCourse(user.id);

		const publications = await createMaterialsWithCourses(user.id, course.id);
		await deleteCourse(course.id);

		for (let i = 0; i < publications.length; i++) {
			const pub = await getPublicationById(publications[i].publicationId);
			expect(pub).toBeDefined();
			expect(pub.courseId).toBeNull();
		}
	});

	it('should unlink the course from other publications when deleted', async () => {
		const user = await createUniqueUser();
		const course = await createRandomCourse(user.id);

		const publications = await createMaterialsWithCourses(user.id, course.id, 1);
		await removeCourseFromPublication(publications[0].publication.id);

		const publicationAfter = await getPublicationById(publications[0].publication.id);
		expect(publicationAfter.course).toBeNull();
	});
});
