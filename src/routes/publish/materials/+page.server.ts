import type { Actions, PageServerLoad } from './$types';

import { type Tag } from '@prisma/client';
import type {
	CourseWithCoverPic
} from '$lib/database/courses';
import { env } from '$env/dynamic/public';
import { buildMaterialForm } from '$lib/util/frontendTypes.ts';
import {
	editCourseAction,
	publishCourseAction,
} from '$lib/server/courseActions.ts';



export const load: PageServerLoad = async ({ fetch, parent, locals }) => {
	await parent();
	const tags: Tag[] = await (await fetch('/api/tags')).json();
	const { users } = await (await fetch(`/api/user`)).json();
	const courses: CourseWithCoverPic[] = await (await fetch(`/api/course-extended/user/${locals.user?.id}`)).json();
	const allCourses: CourseWithCoverPic[] = await (await fetch(`/api/course-extended`)).json();
	return { tags, users, courses, allCourses, PUBLIC_SUPABASE_URL: env.PUBLIC_SUPABASE_URL };
};

export const actions = {
	/**
	 * Publish a new material action.
	 * @param request the request object from the client, *provided by SvelteKit*
	 * @param fetch the fetch function to send requests to the server, *provided by SvelteKit*
	 */
	publish: async ({ request, fetch }) => {
		console.log('Publishing new material...');
		const data = await request.formData();

		const materialForm = await buildMaterialForm(data);

		// if there was an error building the material form, return it directly
		if (!materialForm || typeof materialForm !== 'object' || !('data' in materialForm)) {
			return materialForm;
		}
		const material = materialForm.data;
		const newTagsArray: string[] = materialForm.tags;

		if (newTagsArray.length !== 0) {
			const resTags = await fetch('/api/tags', {
				method: 'POST',
				body: JSON.stringify({ tags: newTagsArray }),
			});
			if (resTags.status !== 200) {
				return {
					status: resTags.status,
					message: await resTags.json(), context: 'publication-form'
				};
			}
		}

		const res = await fetch('/api/material', {
			method: 'POST',
			body: JSON.stringify(material),
		});
		return { status: res.status, id: (await res.json()).id , context: 'publication-form'};
	},
	publishCourse: publishCourseAction,
	editCourse: editCourseAction,
} satisfies Actions;
