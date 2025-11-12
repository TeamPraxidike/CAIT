import type { Actions, PageServerLoad } from './$types';

import { type MaterialForm, type UploadMaterialFileFormat } from '$lib/database';
import { type Difficulty, MaterialType, type Tag } from '@prisma/client';
import { convertMaterial } from '$lib/util/types';
import { redirect } from '@sveltejs/kit';
import type {
	CourseWithCoverPic
} from '$lib/database/courses';
import { env } from '$env/dynamic/public';
import { buildMaterialForm } from '$lib/util/frontendTypes.ts';



export const load: PageServerLoad = async ({ fetch, parent, locals }) => {
	await parent();
	const tags: Tag[] = await (await fetch('/api/tags')).json();
	const { users } = await (await fetch(`/api/user`)).json();
	const courses: CourseWithCoverPic[] = await (await fetch(`/api/course-extended/user/${locals.user?.id}`)).json();
	const allCourses: CourseWithCoverPic[] = await (await fetch(`/api/course-extended`)).json();
	return { tags, users, courses, allCourses, PUBLIC_SUPABASE_URL: env.PUBLIC_SUPABASE_URL };
};

async function extractCourseData(formData: FormData, locals: App.Locals) {
	const title = formData.get('title');
	const level = formData.get('level');
	const learningObjectives = JSON.parse(formData.get('learningObjectives') as string);
	const prerequisites = JSON.parse(formData.get('prerequisites') as string);
	const maintainers = JSON.parse(formData.get('maintainers') as string);
	const copyright = formData.get('copyright') as string;

	const coverPicFile = formData.get('coverPic');
	let coverPic = null;

	if (coverPicFile instanceof File) {
		const buffer = await coverPicFile.arrayBuffer();
		const info = Buffer.from(buffer).toString('base64');
		coverPic = {
			type: coverPicFile.type,
			info,
		};
	}

	return {
		learningObjectives: learningObjectives,
		prerequisites: prerequisites,
		educationalLevel: level,
		courseName: title,
		creatorId: locals.session?.user.id,
		copyright: copyright,
		maintainers: maintainers,
		coverPic: coverPic,
	};
}

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
	publishCourse: async ({request, fetch, locals}) => {
		const session = await locals.safeGetSession();
		if (!session || !session.user) throw redirect(303, '/signin');

		try {
			const formData = await request.formData();
			const courseData = await extractCourseData(formData, locals);

			const res = await fetch(`/api/course`, {
				method: 'POST',
				body: JSON.stringify(courseData),
			});

			const newCourse = await res.json();
			return { status: res.status, id: newCourse.id, context: 'course-form', course: newCourse};
		} catch (error) {
			console.error("Error creating course ", error);
		}
	},
	editCourse: async ({ request, fetch, locals }) => {
		const session = await locals.safeGetSession();
		if (!session || !session.user) throw redirect(303, '/signin');

		try {
			const formData = await request.formData();
			const courseData = await extractCourseData(formData, locals);

			const res = await fetch(`/api/course/${formData.get('id')}` , {
				method: 'PUT',
				body: JSON.stringify(courseData),
			});

			const updatedCourse = await res.json();
			return { status: res.status, id: updatedCourse.id, context: 'course-form', course: updatedCourse };
		} catch (error) {
			console.error('Error updating course ', error);
			return { status: 500, context: 'course-form' };
		}
	},
} satisfies Actions;
