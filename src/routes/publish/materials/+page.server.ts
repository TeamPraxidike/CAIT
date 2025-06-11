import type { Actions, PageServerLoad } from './$types';
import { type MaterialForm } from '$lib/database';
import { type Difficulty, MaterialType, type Tag } from '@prisma/client';

export const load: PageServerLoad = async ({ fetch, parent }) => {
	await parent();
	const tags: Tag[] = await (await fetch('/api/tags')).json();
	const { users } = await (await fetch(`/api/user`)).json();
	return { tags, users };
};

/**
 * Helper function to convert a list of files to a list of objects that can be added to the database.
 * This function reads the file and converts it to a base64 string.
 * It then returns an object with the file's name, type, and base64 string.
 *
 * @param fileList the list of files to be added to the database of type `FileList`.
 */
async function filesToAddOperation(fileList: FileList) {
	const addPromises = Array.from(fileList).map(async (file) => {
		const buffer = await file.arrayBuffer();
		const info = Buffer.from(buffer).toString('base64');

		return {
			title: file.name,
			type: file.type,
			info,
		};
	});

	return await Promise.all(addPromises);
}

const convertMaterial = (s: string): MaterialType => {
	switch (s.toLowerCase()) {
		case 'exam questions':
			return MaterialType.examQuestions;
		case 'lecture notes':
			return MaterialType.lectureNotes;
		case 'slides':
			return MaterialType.slides;
		case 'assignment':
			return MaterialType.assignment;
		case 'other':
			return MaterialType.other;
		case 'video':
			return MaterialType.video;
		default:
			// Handle invalid input if necessary
			return MaterialType.other;
	}
};

export const actions = {
	/**
	 * Publish a new material action.
	 * @param request the request object from the client, *provided by SvelteKit*
	 * @param fetch the fetch function to send requests to the server, *provided by SvelteKit*
	 */
	publish: async ({ request, fetch }) => {
		const data = await request.formData();
		const fileList: FileList = data.getAll('file') as unknown as FileList;
		if (!fileList) return { status: 400, message: 'No files provided' };
		const add = await filesToAddOperation(fileList);

		const tagsDataEntry = data.get('tags');
		if (!tagsDataEntry) return { status: 400, message: 'No tags provided' };

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
					message: await resTags.json(),
				};
			}
		}

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
				isDraft: isDraft
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

		return { status: res.status, id: (await res.json()).id };
	},
} satisfies Actions;
