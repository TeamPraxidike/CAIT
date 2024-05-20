import type { Actions, PageServerLoad } from './$types';
import type {
	FetchedFileArray,
	FetchedFileItem,
	MaterialForm,
} from '$lib/database';
import type { Difficulty, Tag } from '@prisma/client';

export const load: PageServerLoad = async ({ fetch }) => {
	const tagRes = await fetch('/api/tags');

	const tags: Tag[] = await tagRes.json();

	return { tags };
};

export const actions = {
	edit: async ({ request, fetch, params }) => {
		const data = await request.formData();

		/**
		 * New file DATA (File list)
		 */
		const fileList: FileList = data.getAll('file') as unknown as FileList;

		const oldFilesDataFormData = data.get('oldFilesData');
		if (oldFilesDataFormData === null) {
			return { status: 400, message: 'No old files provided' };
		}

		const oldFileData: FetchedFileArray = JSON.parse(
			oldFilesDataFormData.toString(),
		);

		const fileArray: File[] =
			fileList.length === 0 ? [] : Array.from(fileList);

		const addInfo: { title: string; type: string; info: string }[] = [];

		for (const file of fileArray) {
			if (file.size === 0) continue;

			const arBuf = await file.arrayBuffer();
			const buffer = Buffer.from(arBuf);
			const base64String = buffer.toString('base64');
			const index = oldFileData.findIndex(
				(fData: FetchedFileItem) => fData.data === base64String,
			);
			if (index === -1) {
				addInfo.push({
					title: file.name,
					type: file.type,
					info: base64String,
				});
			} else {
				oldFileData.splice(index, 1);
			}
		}

		const deleteInfo = oldFileData.map((data: FetchedFileItem) => {
			return {
				path: data.fileId,
			};
		});

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
				add: addInfo,
				edit: [],
				delete: deleteInfo,
			},
		};

		console.log('PREPARING TO SEND TO BACK-END: ' + material);
		console.log(material);
		console.log(`ADD INFO LENGTH: ` + addInfo.length);

		const res = await fetch('/api/material/' + params.publication, {
			method: 'PUT',
			body: JSON.stringify(material),
		});

		return { status: res.status };
	},
} satisfies Actions;
