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

import { updatePublicationConnectTags, updatePublicationDisconnectTags, updatePublicationDisconnectMaintainers,
updatePublicationConnectMaintainers, connectMaintainers, connectTags, disconnectMaintainers, disconnectTags} from './publication';

import { addFiles } from '$lib/database/file';
import { prisma } from './prisma';

export {
	prisma,
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
	updatePublicationDisconnectMaintainers,
	updatePublicationConnectTags,
	updatePublicationDisconnectTags,
	updateCircuitByPublicationId,
	connectMaintainers,
	connectTags,
	disconnectMaintainers,
	disconnectTags,
	addFiles,
};
