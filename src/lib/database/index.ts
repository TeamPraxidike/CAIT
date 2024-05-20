import {
	getPublicationById,
	//createCircuitPublication,
	//createMaterialPublication,
	addNodeToCircuit,
} from './db';

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
} from './publication';

import {
	handleEdges,
	fetchExtensions,
	addNode,
	editNode,
	deleteNode,
} from './node';

import {
	savePublication,
	getSavedPublications
} from "$lib/database/save";

import {
	getUserById,
	createUser,
	deleteUser,
	editUser,
	likePublication,
	getLikedPublications,
} from '$lib/database/user';

import {
	addPublicationToUsedInCourse,
	coursesUsingPublication,
	publicationsAUserUses
} from "$lib/database/usedInCourse";

import type { userEditData } from '$lib/database/user';

import { addFile, deleteFile, editFile, bufToBase64 } from '$lib/database/file';
import { prisma } from './prisma';
import { LocalFileSystem } from '$lib/FileSystemPort/LocalFileSystem';
import { Difficulty } from '@prisma/client';

const fileSystem = new LocalFileSystem();

/**
 * MaterialForm is the type of the form data that is sent to the server when creating a new material.
 * It is used in the `MaterialForm.svelte` component and on the server side on the POST request to `/api/materials`.
 */
type MaterialForm = {
	userId: number;
	metaData: {
		title: string;
		description: string;
		difficulty: Difficulty;
		learningObjectives: string[];
		prerequisites: string[];
		coverPic: string;
		copyright: boolean;
		timeEstimate: number;
		theoryPractice: number;
		tags: string[];
		maintainers: number[];
	};
	fileDiff: FileDiffActions;
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
	data: string;
};

/**
 * Array of fetched file items.
 */
type FetchedFileArray = FetchedFileItem[];

/**
 * Information about the nodes in the circuit in arrays of operations to add, delete, and edit nodes.
 */
type NodeInfo = {
	add: { circuitId: number; publicationId: number }[];
	delete: { nodeId: number }[];
	edit: { nodeId: number; publicationId: number }[];
	next: { fromId: number; toId: number[] }[];
};

export {
	prisma,
	fileSystem,
	type MaterialForm,
	type FileDiffActions,
	type FetchedFileItem,
	type FetchedFileArray,
	type NodeInfo,
	addFile,
	editFile,
	deleteFile,
	bufToBase64,
	createUser,
	getUserById,
	getPublicationById,
	createCircuitPublication,
	createMaterialPublication,
	addNodeToCircuit,
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
	likePublication,
	getLikedPublications,
	savePublication,
	getSavedPublications,
	addPublicationToUsedInCourse,
	coursesUsingPublication,
	publicationsAUserUses
};

export type { userEditData };
