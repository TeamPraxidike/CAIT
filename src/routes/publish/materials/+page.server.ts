import type {Actions} from './$types'
import type { MaterialForm } from '$lib/database';

export const actions = {
	publish: async ({ request, fetch }) => {
		const data = await request.formData();

		const fileList:FileList = data.getAll('file') as unknown as FileList;

		if (!fileList) return {status: 400};


		const addPromises = Array.from(fileList).map(async (file) => {
			const buffer = await file.arrayBuffer();
			const info = Buffer.from(buffer).toString('base64');

			return {
				title: file.name,
				type: file.type,
				info
			};
		});

		const add = await Promise.all(addPromises);

		const material:MaterialForm = {
			userId: Number(data.get('userId')?.toString()),
			title: data.get('title')?.toString() || '',
			description: data.get('description')?.toString() || '',
			difficulty: 'easy',
			learningObjectives: [data.get('learningObjectives')?.toString() || ''],
			prerequisites: [data.get('prerequisites')?.toString() || ''],
			coverPic: data.get('coverPic')?.toString() || '',
			copyright: Boolean(data.get('copyright')),
			timeEstimate: Number(data.get('estimate')?.toString()),
			theoryPractice: 34,
			fileInfo: {
				add: add,
				delete: [],
				edit: [],
			}
		}

		const res = await fetch('/api/material', {
			method: "POST",
			body: JSON.stringify(material),
		})

		return {status: res.status}
	},
} satisfies Actions;


