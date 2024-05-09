import {getPublicationById, createUser, getUserById,
    createCircuitPublication, createMaterialPublication, addNodeToCircuit} from "./db";

import {getMaterialByPublicationId, getAllMaterials} from "./material";

import {getCircuitByPublicationId, getAllCircuits} from "./circuit";

import {prisma} from "./prisma";

export {prisma, createUser, getUserById, getPublicationById,
    createCircuitPublication, createMaterialPublication, addNodeToCircuit,
    getMaterialByPublicationId, getAllMaterials,
    getCircuitByPublicationId, getAllCircuits};