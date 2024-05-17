import {
	getPublicationById,
	createCircuitPublication,
	createMaterialPublication,
	addNodeToCircuit,
} from './db';

import { getMaterialByPublicationId, getAllMaterials,
	updateMaterialByPublicationId, deleteMaterialByPublicationId } from './material';

import { getCircuitByPublicationId, getAllCircuits,
	updateCircuitByPublicationId, deleteCircuitByPublicationId } from './circuit';

import { updatePublicationConnectTags, updatePublicationConnectMaintainers, connectMaintainers,
	connectTags, handleConnections} from './publication';

import {handleEdges, fetchExtensions, addNode, editNode, deleteNode} from './node'

import {getUserById, createUser, deleteUser, editUser, likePublication, getLikedPublications} from "$lib/database/user";
import type {userEditData} from "$lib/database/user";


import { addFiles } from '$lib/database/file';
import { prisma } from './prisma';
import {LocalFileSystem} from "$lib/FileSystemPort/LocalFileSystem";
import {Blob as NodeBlob} from "node:buffer"

const fileSystem = new LocalFileSystem();

export type FileInfo = {
	add: { title: string; info: Blob }[];
	delete: { path: string }[];
	edit: { path: string, title: string; info: Blob;  }[];
};

export type NodeInfo = {
	add: { circuitId: number; publicationId: number }[];
	delete: { nodeId: number }[];
	edit: { nodeId: number, publicationId: number }[];
	next: { fromId: number; toId: number[] }[];
};

export async function convertBlobToNodeBlob(browserBlob: Blob): Promise<{ buffer: Buffer; info: NodeBlob }> {
	const arrayBuffer = await browserBlob.arrayBuffer();
	const buffer = Buffer.from(arrayBuffer);
	return {buffer: buffer, info: new NodeBlob([buffer], { type: browserBlob.type })};
}

export {
	prisma,
	fileSystem,
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
	addFiles,
	deleteCircuitByPublicationId,
	deleteMaterialByPublicationId,
	deleteUser,
	editUser,
	likePublication,
	getLikedPublications
};

export type {
	userEditData
}
