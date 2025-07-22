import type { Actions, PageServerLoad } from './$types';
import {
	type CircuitForm,
	type FetchedFileArray,
	type FetchedFileItem,
	type MaterialForm,
} from '$lib/database';
import type { Difficulty, MaterialType, Tag } from '@prisma/client';
import { convertMaterial } from '$lib/util/types';

export const load: PageServerLoad = async ({ fetch, parent }) => {
	await parent();
	const tagRes = await fetch('/api/tags');
	const tags: Tag[] = await tagRes.json();
	const usersRes = await fetch('/api/user');
	const { users } = await usersRes.json();
	return { tags, users };
};

export const actions = {
	edit: async ({ request, fetch, params }) => {
		const data = await request.formData();

		const userId = data.get('userId')?.toString() || '';
		const cid = data.get('circuitId')?.toString() || '';
		const mid = data.get('materialId')?.toString() || '';

		const title = data.get('title')?.toString() || '';
		const description = data.get('description')?.toString() || '';
		const isMaterial = data.get('isMaterial')?.toString() || '';
		const difficulty = data.get('difficulty')?.toString() || '';
		const copyright = data.get('copyright')?.toString() || '';
		const time = data.get('timeEstimate')?.toString() || '';
		const theoryApp = data.get('theoryAppRatio')?.toString() || '';
		const type = data.get('type')?.toString() || '';
		const selectedTags = data.get('tags')?.toString() || '';
		const isDraft = data.get('isDraft')?.toString()  === 'true';

		//I need to get the separate strings here so I can create them as string[], but not sure how to do that
		const newTags = data.getAll('newTags') || '';

		const maintainers = data.get('maintainers')?.toString() || '';

		const prior = data.get('PK')?.toString() || '';
		const LOs = data.get('learning_objectives')?.toString() || '';

		const publisherId = data.get('publisherId')?.toString() || '';

		//circuit data does not get carried over to the submission of the form, don't know why
		const circuitData = data.get('circuitData')?.toString() || '';

		const circuitCoverPic = data.get('circuitCoverPic')?.toString() || '';

		const newTagsS = JSON.stringify(newTags);
		const outerArray = JSON.parse(newTagsS);
		const newTagsArray: string[] = JSON.parse(outerArray[0]) || [];

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
		if (isMaterial === 'false') {
			const circuit: CircuitForm & { circuitId: number, publisherId: string } = {
				circuitId: Number(cid),
				publisherId: publisherId,
				userId: userId,
				metaData: {
					title: title,
					description: description,
					difficulty: (difficulty.toLowerCase() as Difficulty) || 'easy',
					learningObjectives: JSON.parse(LOs),
					prerequisites: JSON.parse(prior),
					tags: JSON.parse(selectedTags),
					maintainers: JSON.parse(maintainers),
					isDraft: isDraft,
				},
				coverPic: JSON.parse(circuitCoverPic),
				nodeDiff: JSON.parse(circuitData),
			};

			const res = await fetch(`/api/circuit/${params.publication}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(circuit),
			});

			return { status: res.status };
		} else {
			/**
			 * New file DATA (File list)
			 */
			const fileURLs = JSON.parse(data.get("fileURLs")?.toString() || '');
			const fileList: FileList = data.getAll(
				'file',
			) as unknown as FileList;

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

			const coverPicFile = data.get('coverPicMat');
			let coverPic = null;

			if (coverPicFile instanceof File) {
				const buffer = await coverPicFile.arrayBuffer();
				const info = Buffer.from(buffer).toString('base64');
				coverPic = {
					type: coverPicFile.type,
					info,
				};
			}

			const material: MaterialForm & {
				materialId: number,
				publisherId: string
			} = {
				materialId: Number(mid),
				publisherId: publisherId,
				userId: userId,
				metaData: {
					title: title,
					description: description,
					difficulty:
						(difficulty.toLowerCase() as Difficulty) || 'easy',
					learningObjectives: JSON.parse(LOs),
					prerequisites: JSON.parse(prior),
					copyright: data.get('copyright')?.toString() || '',
					timeEstimate: Number(time),
					theoryPractice: Number(theoryApp),
					tags: JSON.parse(selectedTags),
					maintainers: JSON.parse(maintainers),
					materialType: (data.getAll('type') as string[]).map((type) => convertMaterial(type)),
					isDraft: isDraft,
					fileURLs: fileURLs || [],
					course: 0
				},
				coverPic,
				fileDiff: {
					add: addInfo,
					edit: [],
					delete: deleteInfo,
				},
			};

			const res = await fetch('/api/material/' + params.publication, {
				method: 'PUT',
				body: JSON.stringify(material),
			});

			return { status: res.status };
		}
	},
} satisfies Actions;
