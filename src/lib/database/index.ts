import { getPublicationById } from './db';

import { SERVICE_ROLE_KEY } from '$env/static/private';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';

import {
	createMaterialPublication,
	deleteMaterialByPublicationId,
	getAllMaterials,
	getMaterialByPublicationId,
	updateMaterialByPublicationId
} from './material';

import {
	createCircuitPublication,
	deleteCircuitByPublicationId,
	getAllCircuits,
	getCircuitByPublicationId,
	updateCircuitByPublicationId
} from './circuit';

import {
	connectMaintainers,
	connectTags,
	getPublisherId,
	handleConnections,
	updateAllTimeSaved,
	updatePublicationConnectMaintainers,
	updatePublicationConnectTags
} from './publication';

import { addTag, addTags, deleteTagByContent, getAllTags, getTagByContent } from '$lib/database/tag';

import { addNode, deleteNode, editNode, fetchExtensions, handleEdges } from './node';

import { getSavedPublications, savePublication } from '$lib/database/save';

import type { userEditData } from '$lib/database/user';
import {
	createUser,
	deleteUser,
	editUser,
	getLikedComments,
	getLikedPublications,
	getLikedReplies,
	getUserById,
	likePublication,
	likesCommentUpdate,
	likesReplyUpdate,
	updateReputation
} from '$lib/database/user';

import type { createCommentData, editCommentData } from '$lib/database/comment';
import {
	createComment,
	deleteComment,
	getComment,
	getCommentsByPublicationId,
	updateComment
} from '$lib/database/comment';

import type { createReplyData, editReplyData } from '$lib/database/reply';
import { createReply, deleteReply, getRepliesByCommentId, getReply, updateReply } from '$lib/database/reply';

import {
	addPublicationToUsedInCourse,
	coursesUsingPublication,
	publicationsAUserUses
} from '$lib/database/usedInCourse';

import {
	addCoverPic,
	addFile,
	coverPicFetcher,
	deleteFile,
	editFile,
	updateCoverPic,
	updateFiles
} from '$lib/database/file';

import { handleSimilarity } from '$lib/database/similarity';

import { prisma } from './prisma';
import { Difficulty, MaterialType } from '@prisma/client';
import { SupabaseFileSystem } from '$lib/FileSystemPort/SupabaseFileSystem';
import { LocalFileSystem } from '$lib/FileSystemPort/LocalFileSystem';
import type { ChangeLogPayload } from '$lib/database/publicationHistory';

/**
 * MaterialForm is the type of the form data that is sent to the server when creating a new material.
 * It is used in the `MaterialForm.svelte` component and on the server side on the POST request to `/api/materials`.
 */
type MaterialForm = {
	userId: string;
	metaData: {
		title: string;
		description: string;
		difficulty: Difficulty;
		learningObjectives: string[];
		prerequisites: string[];
		materialType: MaterialType[];
		copyright: string;
		timeEstimate: number;
		theoryPractice: number;
		selfMade: boolean;
		tags: string[];
		maintainers: string[];
		isDraft: boolean;
		fileURLs: string[];
		course: number;
	};
	coverPic: { type: string; info: string } | null;
	fileDiff: FileDiffActions;
	changeLog: ChangeLogPayload;
};

type UserCreateForm = {
	metaData: {
		firstName: string;
		lastName: string;
		email: string;
	};
};

type UserForm = {

	metaData: {
		firstName: string;
		lastName: string;
		email: string;
		aboutMe: string;
	};
	profilePic: { type: string; info: string } | null;
};

type CircuitForm = {
	userId: string;
	metaData: {
		title: string;
		description: string;
		difficulty: Difficulty;
		learningObjectives: string[];
		prerequisites: string[];
		tags: string[];
		maintainers: string[];
		isDraft: boolean;
	};
	coverPic: { type: string; info: string } | null;
	nodeDiff: NodeDiffActions;
};

/**
 * Information about the difference between the files in the current material and the files in the new material.
 * This type holds arrays for files that are added, deleted, and edited in the new material.
 *
 * @note These changes are evaluated on the server in `+page.server.ts` and then sent like this
 * to the server in the POST request to `/api/materials`
 */
type FileDiffActions = {
	add: { title: string; type: string; info: string }[];
	delete: { path: string }[];
	edit: { path: string; title: string; info: string }[];
};

type FetchedFileItem = {
	fileId: string;
	name?: string;
	type?: string;
	data: string | null;
};

/**
 * Type used exclusively for files in a material publication (excluding cover picture)
 * This information is fed to the backend in this format
 */
type UploadMaterialFileFormat = {
	title: string,
	type: string,
	info: string
}

/**
 * Array of fetched file items.
 */
type FetchedFileArray = FetchedFileItem[];

/**
 * Information about the nodes in the circuit in arrays of operations to add, delete, and edit nodes.
 */

type NodeDiffActions = {
	numNodes: number;
	add: { publicationId: number; x: number; y: number }[];
	delete: { publicationId: number }[];
	edit: { publicationId: number; x: number; y: number }[];
	// from publicationId, to (many) other publicationIds
	next: { fromId: number; toId: number[] }[];
};


/////////////////////////////////////////////////////////
/// SELECT FILESYSTEM TYPE BASED ON .ENV VARIABLE
////////////////////////////////////////////////////////

export const basePath = "uploadedFiles"
let fileSystem: SupabaseFileSystem | LocalFileSystem;

if (process.env.FILESYSTEM === "SUPABASE") {
	fileSystem = new SupabaseFileSystem(PUBLIC_SUPABASE_URL,
		SERVICE_ROLE_KEY, basePath)
}
else fileSystem = new LocalFileSystem(basePath);


////////////////////////////////////////////////////////

export {
	prisma,
	fileSystem,
	type UserForm,
	type MaterialForm,
	type CircuitForm,
	type FileDiffActions,
	type FetchedFileItem,
	type FetchedFileArray,
	type NodeDiffActions,
	type UploadMaterialFileFormat,
	handleSimilarity,
	updateFiles,
	coverPicFetcher,
	updateCoverPic,
	addCoverPic,
	addFile,
	editFile,
	deleteFile,
	createUser,
	getUserById,
	getPublicationById,
	createCircuitPublication,
	createMaterialPublication,
	updateMaterialByPublicationId,
	getMaterialByPublicationId,
	getAllMaterials,
	getCircuitByPublicationId,
	getAllCircuits,
	updatePublicationConnectMaintainers,
	updatePublicationConnectTags,
	updateCircuitByPublicationId,
	connectMaintainers,
	connectTags,
	handleConnections,
	handleEdges,
	fetchExtensions,
	addNode,
	deleteNode,
	editNode,
	deleteCircuitByPublicationId,
	deleteMaterialByPublicationId,
	deleteUser,
	editUser,
	updateComment,
	createComment,
	deleteComment,
	getComment,
	deleteReply,
	getReply,
	updateReply,
	createReply,
	likePublication,
	getLikedPublications,
	savePublication,
	getSavedPublications,
	addPublicationToUsedInCourse,
	coursesUsingPublication,
	publicationsAUserUses,
	getRepliesByCommentId,
	getCommentsByPublicationId,
	getLikedReplies,
	getLikedComments,
	likesCommentUpdate,
	likesReplyUpdate,
	addTag,
	addTags,
	getAllTags,
	getTagByContent,
	deleteTagByContent,
	updateReputation,
	updateAllTimeSaved,
	getPublisherId
};

export type {
	userEditData,
	createReplyData,
	createCommentData,
	editCommentData,
	editReplyData,
	UserCreateForm,
};
