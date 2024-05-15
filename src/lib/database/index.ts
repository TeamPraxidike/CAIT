import {
	getPublicationById,
	createCircuitPublication,
	createMaterialPublication,
	addNodeToCircuit,
} from './db';

import { getMaterialByPublicationId, getAllMaterials } from './material';

import { getCircuitByPublicationId, getAllCircuits } from './circuit';
import {getUserById, createUser, deleteUser, editUser} from "$lib/database/user";
import type {userEditData} from "$lib/database/user";

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
	deleteUser,
	editUser,
};

export type {
	userEditData
}
