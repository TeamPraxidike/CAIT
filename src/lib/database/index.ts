import {
	getPublicationById,
	createUser,
	getUserById,
	createCircuitPublication,
	createMaterialPublication,
	addNodeToCircuit,
} from './db';

import {
	getMaterialByPublicationId,
	getAllMaterials,
	deleteMaterialByPublicationId,
} from './material';

import {
	getCircuitByPublicationId,
	getAllCircuits,
	deleteCircuitByPublicationId,
} from './circuit';

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
	getMaterialByPublicationId,
	getAllMaterials,
	getCircuitByPublicationId,
	getAllCircuits,
	addFiles,
	deleteCircuitByPublicationId,
	deleteMaterialByPublicationId,
};
