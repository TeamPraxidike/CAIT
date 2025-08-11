import type { Actions, PageServerLoad } from './$types';

import { type MaterialForm, type UploadMaterialFileFormat } from '$lib/database';
import { type Difficulty, type Tag } from '@prisma/client';
import { convertMaterial } from '$lib/util/types';
import { redirect } from '@sveltejs/kit';
import {type CourseWithMaintainersAndProfilePic} from '$lib/database/courses';


export const load: PageServerLoad = async ({ fetch, parent, locals }) => {
	await parent();
	const tags: Tag[] = await (await fetch('/api/tags')).json();
	const { users } = await (await fetch(`/api/user`)).json();
	const courses: CourseWithMaintainersAndProfilePic[] = await (await fetch(`/api/course-extended/user/${locals.user?.id}`)).json();
	const allCourses: CourseWithMaintainersAndProfilePic[] = await (await fetch(`/api/course-extended`)).json();
	// const courses: Course[] = await (await fetch(`/api/course/user/${locals.user?.id}`)).json();
	// const allCourses: Course[] = await (await fetch(`/api/course`)).json();
	return { tags, users, courses, allCourses };
};

/**
 * Helper function to convert a list of files to a list of objects that can be added to the database.
 * This function reads the file and converts it to a base64 string.
 * It then returns an object with the file's name, type, and base64 string.
 *
 * @param fileList the list of files to be added to the database of type `FileList`.
 * @param fileURLs the list of URLs pointing to files to be added to the database of type `FileList`.
 */
async function filesToAddOperation(fileList: FileList, fileURLs: string[] = []) {
	const addPromises = Array.from(fileList).map(async (file) => {
		const buffer = await file.arrayBuffer();
		const info = Buffer.from(buffer).toString('base64');

		return {
			title: file.name,
			type: file.type,
			info,
		};
	});
	const addURLs = Array.from(fileURLs).map((url) => {
		return {
			title: url,
			type: "URL",
			info: url,
		};
	});

	return (await Promise.all(addPromises)).concat(addURLs);
}

export const actions = {
	/**
	 * Publish a new material action.
	 * @param request the request object from the client, *provided by SvelteKit*
	 * @param fetch the fetch function to send requests to the server, *provided by SvelteKit*
	 */
	publish: async ({ request, fetch }) => {
		const data = await request.formData();

		// ignore if the context is not correct
		if (data.get('context') === 'course-form') {
			return { status: 418, context: 'course-form'};
		}
		console.log("after 418");

		const fileList: string[] = data.getAll('file') as unknown as string[];
		const fileURLs: string[] = data.getAll('fileURLs') as unknown as string[];
		if (!fileList || fileList.length < 1) return { status: 400, message: 'No files provided', context: 'publication-form'};
		// const add = await filesToAddOperation(fileList, fileURLs);
		console.log("After 400");

		const add = fileList.concat(fileURLs).map((item: string) => {
			return JSON.parse(item) as UploadMaterialFileFormat
		});

		const tagsDataEntry = data.get('tags');
		if (!tagsDataEntry) return { status: 400, message: 'No tags provided', context: 'publication-form' };

		console.log("After 400 second");

		const losDataEntry = data.get('learningObjectives');
		const maintainersDataEntry = data.get('maintainers');
		const coverPicFile = data.get('coverPic');
		const isDraft = data.get('isDraft')?.toString() === 'true';
		let coverPic = null;

		if (coverPicFile instanceof File) {
			const buffer = await coverPicFile.arrayBuffer();
			const info = Buffer.from(buffer).toString('base64');
			coverPic = {
				type: coverPicFile.type,
				info,
			};
		}

		console.log("After cover pic");

		const userId = data.get('userId')?.toString();
		if (userId === undefined) throw new Error('User id is undefined');

		const newTags = data.getAll('newTags') || '';
		const newTagsJ = JSON.stringify(newTags);
		const outerArray = JSON.parse(newTagsJ);
		const newTagsArray: string[] = JSON.parse(outerArray[0]);

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

		console.log("After tags");

		const material: MaterialForm = {
			userId,
			metaData: {
				title: data.get('title')?.toString() || '',
				description: data.get('description')?.toString() || '',
				difficulty:
					((
						data.get('difficulty')?.toString() || ''
					).toLowerCase() as Difficulty) || 'easy',
				learningObjectives: JSON.parse(losDataEntry?.toString() || ''),
				prerequisites: JSON.parse(
					data.get('prerequisites')?.toString() || '',
				),
				copyright: data.get('copyright')?.toString() || '',
				timeEstimate: Number(data.get('estimate')?.toString()),
				theoryPractice: Number(data.get('theoryToApplication')),
				tags: JSON.parse(tagsDataEntry.toString()),
				maintainers: JSON.parse(maintainersDataEntry?.toString() || ''),
				materialType: (data.getAll('type') as string[]).map((type) => convertMaterial(type)),
				isDraft: isDraft,
				fileURLs: fileURLs || [],
				course: Number(data.get('course')?.toString()),
			},
			coverPic,
			fileDiff: {
				add,
				delete: [],
				edit: [],
			},
		};
		const res = await fetch('/api/material', {
			method: 'POST',
			body: JSON.stringify(material),
		});

		console.log("After material");

		return { status: res.status, id: (await res.json()).id , context: 'publication-form'};
		// return { status: res.status, id: (await res.json()).id , context: data.get('fomrContext')?.toString()};
	},
	publishCourse: async ({request, fetch, locals}) => {
		const session = await locals.safeGetSession();
		if (!session || !session.user) throw redirect(303, '/signin');

		try {
			const formData = await request.formData();
			const title = formData.get('title');
			const level = formData.get('level');
			const learningObjectives = JSON.parse(formData.get('learningObjectives') as string);
			const prerequisites = JSON.parse(formData.get('prerequisites') as string);
			const maintainers = JSON.parse(formData.get('maintainers') as string);
			const courseData = {
				learningObjectives: learningObjectives,
				prerequisites: prerequisites,
				educationalLevel: level,
				courseName: title,
				creatorId: locals.session?.user.id,
				maintainers: maintainers,
			};
			const res = await fetch(`/api/course`, {
				method: 'POST',
				body: JSON.stringify(courseData),
			});
			const newCourse = await res.json();
			return { status: res.status, id: newCourse.id , context: 'course-form'};
		} catch (error) {
			console.error("Error creating course ", error);
			throw redirect(303, '/course/create');
		}
	},
} satisfies Actions;
