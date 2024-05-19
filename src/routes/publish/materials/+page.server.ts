import type { Actions, PageServerLoad } from './$types';
import type { MaterialForm } from '$lib/database';
import type { Tag } from '@prisma/client';

export const load: PageServerLoad = async ({ fetch }) => {
	const tagRes = await fetch('/api/tags');
	const tags: Tag[] = await tagRes.json();
	return { tags };
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
		console.log(typeof file);
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

		const material: MaterialForm = {
			userId: Number(data.get('userId')?.toString()),
			metaData: {
				title: data.get('title')?.toString() || '',
				description: data.get('description')?.toString() || '',
				difficulty: 'easy',
				learningObjectives: data
					.get('learningObjectives')
					?.toString()
					.split(';') || [''],
				prerequisites: [data.get('prerequisites')?.toString() || ''],
				coverPic: data.get('coverPic')?.toString() || '',
				copyright: Boolean(data.get('copyright')),
				timeEstimate: Number(data.get('estimate')?.toString()),
				theoryPractice: 34,
				tags: data.get('tags')?.toString().split(';') || [''],
				maintainers: data
					.get('maintainers')
					?.toString()
					.split(';')
					.map(Number) || [Number(data.get('userId')?.toString())],
			},
			fileDiff: {
				add: add,
				delete: [],
				edit: [],
			},
		};

		const res = await fetch('/api/material', {
			method: 'POST',
			body: JSON.stringify(material),
		});

		return { status: res.status };
	},
} satisfies Actions;
