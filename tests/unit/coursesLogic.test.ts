import { describe, it, expect } from 'vitest';
import { changeCourse, type UserWithProfilePic } from '$lib/util/coursesLogic';
import type { CourseWithMaintainersAndProfilePic } from '$lib/database/courses';



describe('Selecting a new courses', () => {
	it('should add it when there is nothing else', async () => {
		const course = 1;
		const previousCourse = null;
		const LOs: string[] = [];
		const PKs: string[] = [];
		const courses = [
			{ id: 1, learningObjectives: ['LO1'], prerequisites: ['PK1'], maintainers: [{ id: 'm1', name: 'Maintainer 1' }] },
			{ id: 2, learningObjectives: ['LO2'], prerequisites: ['PK2'], maintainers: [{ id: 'm2', name: 'Maintainer 2' }] }
		] as unknown as CourseWithMaintainersAndProfilePic[];
		const mantainers: UserWithProfilePic[] = [];

		const res = changeCourse(course, previousCourse, LOs, PKs, courses, mantainers);
		console.log(res);
		expect(res.course).toBe(1);
		expect(res.LOs).toEqual(['LO1']);
		expect(res.PKs).toEqual(['PK1']);
		expect(res.maintainers).toEqual([{ id: 'm1', name: 'Maintainer 1' }]);
	});
});
