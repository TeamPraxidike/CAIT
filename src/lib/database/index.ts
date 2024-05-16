import {
	getPublicationById,
	createUser,
	getUserById,
	createCircuitPublication,
	createMaterialPublication,
	addNodeToCircuit,
} from './db';

import { getMaterialByPublicationId, getAllMaterials, updateMaterialByPublicationId } from './material';

import { getCircuitByPublicationId, getAllCircuits, updateCircuitByPublicationId} from './circuit';

import { updatePublicationConnectTags, updatePublicationConnectMaintainers, connectMaintainers,
	connectTags, handleConnections} from './publication';

import {handleEdges, fetchExtensions, addNode, editNode, deleteNode} from './node'

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

export async function convertBlobToNodeBlob(browserBlob: Blob): Promise<NodeBlob> {
	const arrayBuffer = await browserBlob.arrayBuffer();
	const buffer = Buffer.from(arrayBuffer);
	return new NodeBlob([buffer], { type: browserBlob.type });
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
	addFiles
};
