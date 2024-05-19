import type { Actions, PageServerLoad } from './$types';
import type { MaterialForm } from '$lib/database';
import type { Difficulty, Tag } from '@prisma/client';

export const load: PageServerLoad = async ({ fetch }) => {
	const tagRes = await fetch('/api/tags');

	const tags: Tag[] = await tagRes.json();

	return { tags };
};

export const actions = {
	edit: async ({ request, fetch, params }) => {
		const data = await request.formData();

		// const fileList: FileList = data.getAll('file') as unknown as FileList;
		// const oldFileList: FileList = data.getAll(
		// 	'oldFile',
		// ) as unknown as FileList;
		//
		// const oldFilesPaths: string[] = data.getAll(
		// 	'oldFilePath',
		// ) as unknown as string[];
		// const oldFilesTypes: string[] = data.getAll(
		// 	'oldFilesType',
		// ) as unknown as string[];
		// const oldFilesTitles: string[] = data.getAll(
		// 	'oldFilesTitle',
		// ) as unknown as string[];
		//
		// const fileInfos: {
		// 	type: string;
		// 	path: string;
		// 	title: string;
		// }[] = [];
		//
		// for (let i = 0; i < oldFilesPaths.length; i++) {
		// 	fileInfos.push({
		// 		type: oldFilesTypes[i],
		// 		path: oldFilesPaths[i],
		// 		title: oldFilesTitles[i],
		// 	});
		// }

		const material: MaterialForm & {
			materialId: number;
		} = {
			materialId: parseInt(params.publication),
			userId: Number(data.get('userId')?.toString()),
			metaData: {
				title: data.get('title')?.toString() || '',
				description: data.get('description')?.toString() || '',
				difficulty:
					(data.get('difficulty')?.toString() as Difficulty) ||
					'easy',
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
				add: [],
				edit: [],
				delete: [],
			},
		};

		const res = await fetch('/api/material/' + params.publication, {
			method: 'PUT',
			body: JSON.stringify(material),
		});

		return { status: res.status };
	},
} satisfies Actions;
