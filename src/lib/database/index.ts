import { getPublicationById } from './db';

import {
	getMaterialByPublicationId,
	getAllMaterials,
	updateMaterialByPublicationId,
	deleteMaterialByPublicationId,
	createMaterialPublication,
} from './material';

import {
	getCircuitByPublicationId,
	getAllCircuits,
	updateCircuitByPublicationId,
	deleteCircuitByPublicationId,
	createCircuitPublication,
} from './circuit';

import {
	updatePublicationConnectTags,
	updatePublicationConnectMaintainers,
	connectMaintainers,
	connectTags,
	handleConnections,
	updateAllTimeSaved,
} from './publication';

import {
	addTag,
	addTags,
	getAllTags,
	getTagByContent,
	deleteTagByContent,
} from '$lib/database/tag';

import {
	handleEdges,
	fetchExtensions,
	addNode,
	editNode,
	deleteNode,
} from './node';

import { savePublication, getSavedPublications } from '$lib/database/save';

import {
	getUserById,
	createUser,
	deleteUser,
	editUser,
	likePublication,
	getLikedPublications,
	likesReplyUpdate,
	likesCommentUpdate,
	getLikedReplies,
	getLikedComments,
	updateReputation,
} from '$lib/database/user';

import {
	createComment,
	deleteComment,
	getComment,
	updateComment,
	getCommentsByPublicationId,
} from '$lib/database/comment';

import {
	getReply,
	deleteReply,
	updateReply,
	createReply,
	getRepliesByCommentId,
} from '$lib/database/reply';

import {
	addPublicationToUsedInCourse,
	coursesUsingPublication,
	publicationsAUserUses,
} from '$lib/database/usedInCourse';

import type { userEditData } from '$lib/database/user';
import type { editReplyData, createReplyData } from '$lib/database/reply';
import type { createCommentData, editCommentData } from '$lib/database/comment';

import {
	addFile,
	deleteFile,
	editFile,
	addCoverPic,
	coverPicFetcher,
	updateCoverPic,
	updateCircuitCoverPic,
	updateFiles,
} from '$lib/database/file';

import {handleSimilarity} from "$lib/database/similarity";

import { prisma } from './prisma';
import { LocalFileSystem } from '$lib/FileSystemPort/LocalFileSystem';
import { Difficulty, MaterialType } from '@prisma/client';
import path from 'path';

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
		materialType: MaterialType;
		copyright: string;
		timeEstimate: number;
		theoryPractice: number;
		tags: string[];
		maintainers: string[];
	};
	coverPic: { type: string; info: string } | null;
	fileDiff: FileDiffActions;
};

type UserCreateForm = {
	metaData: {
		firstName: string;
		lastName: string;
		email: string;
		password: string;
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
 * @todo may be much better to use an object with keys `add`, `delete`, and `edit` instead of arrays
 */
type FileDiffActions = {
	add: { title: string; type: string; info: string }[];
	delete: { path: string }[];
	edit: { path: string; title: string; info: string }[];
};

/**
 * Fetched file item with the id and the data in the form of a base64 string.
 */
type FetchedFileItem = {
	fileId: string;
	data: string | null;
};

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

//export const basePath = path.join('static', 'uploadedFiles');
export const basePath = "uploadedFiles"
export const fileSystem = new LocalFileSystem(basePath);

export {
	prisma,
	type UserForm,
	type MaterialForm,
	type CircuitForm,
	type FileDiffActions,
	type FetchedFileItem,
	type FetchedFileArray,
	type NodeDiffActions,
	handleSimilarity,
	updateCircuitCoverPic,
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
};

export type {
	userEditData,
	createReplyData,
	createCommentData,
	editCommentData,
	editReplyData,
	UserCreateForm,
};
