import type { Actions, PageServerLoad } from './$types';
import {
	type CircuitForm,
	type FetchedFileArray,
	type FetchedFileItem,
	type MaterialForm, type UploadMaterialFileFormat
} from '$lib/database';
import type { Difficulty, Material, Tag } from '@prisma/client';
import { convertMaterial } from '$lib/util/types';
import type { Course, CourseWithCoverPic } from '$lib/database/courses';
import { env } from '$env/dynamic/public';
import { log } from 'node:util';
import { buildMaterialForm } from '$lib/util/frontendTypes.ts';

// export const load: PageServerLoad = async ({ fetch, parent, locals }) => {
// 	await parent();
// 	const tagRes = await fetch('/api/tags');
// 	const tags: Tag[] = await tagRes.json();
// 	const usersRes = await fetch('/api/user');
// 	const { users } = await usersRes.json();
// 	const courses: Course[] = await (await fetch(`/api/course/user/${locals.user?.id}`)).json();
// 	return { tags, users, courses, PUBLIC_SUPABASE_URL: env.PUBLIC_SUPABASE_URL };
// };

export const load: PageServerLoad = async ({ fetch, parent, locals }) => {
	await parent();
	const tags: Tag[] = await (await fetch('/api/tags')).json();
	const { users } = await (await fetch(`/api/user`)).json();
	const courses: CourseWithCoverPic[] = await (await fetch(`/api/course-extended/user/${locals.user?.id}`)).json();
	const allCourses: CourseWithCoverPic[] = await (await fetch(`/api/course-extended`)).json();
	return { tags, users, courses, allCourses, PUBLIC_SUPABASE_URL: env.PUBLIC_SUPABASE_URL };
};

export const actions = {
	edit: async ({ request, fetch, params }) => {
		const data = await request.formData();

		const userId = data.get('userId')?.toString() || '';
		const mid = data.get('materialId')?.toString() || '';
		const publisherId = data.get('publisherId')?.toString() || '';


		const materialForm = await buildMaterialForm(data);

		// if there was an error building the material form, return it directly
		if (!materialForm || typeof materialForm !== 'object' || !('data' in materialForm)) {
			return materialForm;
		}
		const material: MaterialForm & {materialId: number, publisherId: string} = {...materialForm.data, publisherId: publisherId, materialId: Number(mid)};
		const newTagsArray: string[] = materialForm.tags;

		if (newTagsArray.length !== 0) {
			const resTags = await fetch('/api/tags', {
				method: 'POST',
				body: JSON.stringify({ tags: newTagsArray }),
			});
			if (resTags.status !== 200) {
				return {
					status: resTags.status,
					message: await resTags.json(),
				};
			}
		}
		if (userId === undefined) {
			throw new Error('User Id was undefined');
		}
		/**
		 * New file DATA (File list)
		 */

		// const fileList: string[] = data.getAll('file') as unknown as string[];
		// const fileURLs: string[] = data.getAll('fileURLs') as unknown as string[];
		// if ((!fileList && !fileURLs) || fileList.length + fileURLs.length < 1) return { status: 400, message: 'No files provided', context: 'publication-form'};

		// const fileListUnformated: string[] = data.getAll('file') as unknown as string[];
		// const fileList: UploadMaterialFileFormat[] = fileListUnformated.map(item => {
		// 	return JSON.parse(item) as UploadMaterialFileFormat
		// })

		const oldFilesDataFormData = data.get('oldFilesData');
		if (oldFilesDataFormData === null) {
			return { status: 400, message: 'No old files provided' };
		}
		const oldFileData: string[] = JSON.parse(
			oldFilesDataFormData.toString(),
		);

		const currFiles = material.fileDiff.add ?? [];
		const currFilesPaths = currFiles.map((x) => x.title);
		const newFiles: typeof currFiles = [];
		const deletedFiles: {path: string}[] = [];

		currFiles.forEach((file) => {
			if (!oldFileData.some((f) => f === file.title)) newFiles.push(file);
		});
		oldFileData.forEach((file) => {
			if (!currFilesPaths.includes(file)) {
				deletedFiles.push({ path: file });
			}
		});
		material.fileDiff.add = newFiles;
		material.fileDiff.delete = deletedFiles; // TODO fix this

		const res = await fetch('/api/material/' + params.publication, {
			method: 'PUT',
			body: JSON.stringify(material),
		});

		return {
			status: res.status,
			context: 'publication-form'
		};
	},
} satisfies Actions;
