import type { Actions, PageServerLoad } from './$types';
import type { CourseWithCoverPic } from '$lib/database/courses';
import {
	publishCourseAction,
} from '$lib/server/courseActions.ts';

export const load: PageServerLoad = async ({ fetch, parent, locals }) => {
	await parent();
	const { users } = await (await fetch(`/api/user`)).json();
	const courses: CourseWithCoverPic[] = await (await fetch(`/api/course-extended/user/${locals.user?.id}`)).json();
	const allCourses: CourseWithCoverPic[] = await (await fetch(`/api/course-extended`)).json();
	return { users, courses, allCourses };
};

export const actions = {
	publishCourse: publishCourseAction,
} satisfies Actions;

