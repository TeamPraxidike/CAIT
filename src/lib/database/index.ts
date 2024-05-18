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
	getUserById,
	createUser,
	deleteUser,
	editUser,
} from '$lib/database/user';

import {
	createComment,
	deleteComment,
	getComment,
	updateComment,
} from '$lib/database/comment';

import {
	getReply,
	deleteReply,
	updateReply,
	createReply,
} from '$lib/database/reply';
import type { userEditData } from '$lib/database/user';
import type { editReplyData, createReplyData } from '$lib/database/reply';
import type { createCommentData, editCommentData } from '$lib/database/comment';
import {getUserById, createUser, deleteUser, editUser, likePublication, getLikedPublications} from "$lib/database/user";
import type {userEditData} from "$lib/database/user";

import { addFile, deleteFile, editFile, bufToBase64 } from '$lib/database/file';
import { prisma } from './prisma';
import { LocalFileSystem } from '$lib/FileSystemPort/LocalFileSystem';
import { Difficulty } from '@prisma/client';

const fileSystem = new LocalFileSystem();

export type MaterialForm = {
	userId: number;
	title: string;
	description: string;
	difficulty: Difficulty;
	learningObjectives: string[];
	prerequisites: string[];
	coverPic: string;
	copyright: boolean;
	timeEstimate: number;
	theoryPractice: 34;
	fileInfo: FileInfo;
};

export type FileInfo = {
	add: { title: string; type: string; info: string }[];
	delete: { path: string }[];
	edit: { path: string; title: string; info: string }[];
};

export type FetchedFileItem = {
	fileId: string;
	data: string;
};

export type FetchedFileArray = FetchedFileItem[];

export type NodeInfo = {
	add: { circuitId: number; publicationId: number }[];
	delete: { nodeId: number }[];
	edit: { nodeId: number; publicationId: number }[];
	next: { fromId: number; toId: number[] }[];
};

export {
	prisma,
	fileSystem,
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
	updateComment,
	createComment,
	deleteComment,
	getComment,
	deleteReply,
	getReply,
	updateReply,
	createReply,
	likePublication,
	getLikedPublications
};

export type {
	userEditData,
	createReplyData,
	createCommentData,
	editCommentData,
	editReplyData,
};
