import type { FileTUSMetadata } from '$lib/util/indexDB.ts';
import type { CourseWithCoverPic } from '$lib/database/courses.ts';
import type { UserWithProfilePic } from '$lib/util/coursesLogic.ts';
import type {  Tag as PrismaTag } from '@prisma/client';

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
	uid: number | null;
	form: any;
	allTags: PrismaTag[];
};

export type PublishParams = {
	mutable: ParamsMutable;
	immutable: ParamsImmutable;
}