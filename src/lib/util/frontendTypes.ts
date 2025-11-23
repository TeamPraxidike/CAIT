import type { FileTUSMetadata } from '$lib/util/indexDB.ts';
import type { CourseWithCoverPic } from '$lib/database/courses.ts';
import type { UserWithProfilePic } from '$lib/util/coursesLogic.ts';
import {
	type Difficulty,
	MaterialType,
	type Tag as PrismaTag,
} from '@prisma/client';
import type { MaterialForm, UploadMaterialFileFormat } from '$lib/database';
import { convertMaterial } from '$lib/util/types.ts';

export type ParamsMutable = {
	isSubmitting: boolean;
	fileTUSMetadata: { [key: string] : FileTUSMetadata };
	fileTUSProgress: { [key: string]: any };
	fileTUSUploadObjects: { [key: string]: any };
	fileURLs: string[];
	files: FileList;
	title: string;
	showCourseProgressRadial: boolean;
	selectedTypes: string[];
	originalCourseIds: number[];
	courses: CourseWithCoverPic[];
	course: number | null;
	coverPic: File | undefined;
	loggedUser: any;
	searchableUsers: UserWithProfilePic[];
	estimate: number;
	copyright: string;
	LOs: string[];
	PKs: string[];
	maintainers: UserWithProfilePic[];
	tags: string[];
	newTags: string[];
	description: string;
};

export type ParamsImmutable = {
	supabaseClient: any;
	supabaseURL: string;
	users: UserWithProfilePic[];
	allCourses: CourseWithCoverPic[];
	uid: string | undefined;
	form: any;
	allTags: PrismaTag[];
};

export type PublishParams = {
	mutable: ParamsMutable;
	immutable: ParamsImmutable;
}

// Think we have a common file type, may be better to use it instead of this one
export type URLtype = {
	title: string;
	info: string;
	type: string
}

export async function buildMaterialForm(data: FormData): Promise<{data: MaterialForm, tags: string[]} | {
	status: number;
	message: string;
	context: string
}> {
	// ignore if the context is not correct
	if (data.get('context') === 'course-form') {
		return { status: 418, context: 'course-form', message: 'Wrong context' };
	}

	const fileList: string[] = data.getAll('file') as unknown as string[];
	const fileURLs: URLtype[] = data.getAll('fileURLs').map(x => JSON.parse(x.toString())) as URLtype[];
	if ((!fileList && !fileURLs) || fileList.length + fileURLs.length < 1) return { status: 400, message: 'No files provided', context: 'publication-form'};
	// const add = await filesToAddOperation(fileList, fileURLs);

	const add = fileList.map((item: string) => {
		return JSON.parse(item) as UploadMaterialFileFormat
	});

	const tagsDataEntry = data.get('tags');
	if (!tagsDataEntry) return { status: 400, message: 'No tags provided', context: 'publication-form' };

	const losDataEntry = data.get('learningObjectives');
	const maintainersDataEntry = data.get('maintainers');
	const coverPicFile = data.get('coverPic');
	const isDraft = data.get('isDraft')?.toString() === 'true';
	let coverPic = null;
	const materialTypes = JSON.parse(data.get('type')?.toString() as string).map((type: string) => convertMaterial(type));
	if (materialTypes.length === 0) {
		materialTypes.push(MaterialType.other)
	}

	if (coverPicFile instanceof File) {
		const buffer = await coverPicFile.arrayBuffer();
		const info = Buffer.from(buffer).toString('base64'); //correct
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
	console.log("URLs ", fileURLs);
	const dataForm = {
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
			materialType: materialTypes,
			isDraft: isDraft,
			fileURLs: fileURLs.map(x => x.title) || [],
			course: Number(data.get('course')?.toString()),
		},
		coverPic,
		fileDiff: {
			add,
			delete: [],
			edit: [],
		},
	};

	return {data: dataForm, tags: newTagsArray}
}