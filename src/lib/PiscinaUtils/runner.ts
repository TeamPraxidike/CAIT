import Piscina from 'piscina';
import {
    getAllCircuits,
    getAllMaterials,
    getCircuitByPublicationId,
    getMaterialByPublicationId,
    handleSimilarity
} from "$lib/database";
import type {Difficulty, File as PrismaFile} from "@prisma/client";
import {getFilesForMaterial, handleFileTokens} from "$lib/database/file";
import path from 'path';

export type PublicationMeta = {
    title: string;
    description: string;
    learningObjectives: string[];
    prerequisites: string[];
    tags: string[];
    difficulty: Difficulty
};

export type ResultMeta = {
    title: number;
    description: number;
    learningObjectives: number;
    prerequisites: number;
    tags: number;
    difficulty: number;
};

export type FileTokenInfo = {filePath: string, tokens: string}[]

export type ResultFile = {
    similarity: number,
    filesToUpdate: FileTokenInfo
};

const piscina = new Piscina({
    //filename: new URL('./worker.mjs', import.meta.url).href,
    filename: path.join("src", "lib", "PiscinaUtils", "worker.mjs"),
    minThreads: 1, // Minimum number of threads to start with
    maxThreads: 1, // Max number of concurrent workers
    idleTimeout: 60000 // Keep idle workers alive for 60 seconds
});


/**
 * Method which sends task to a worker thread (circuit)
 * @param pubANodes
 * @param pubBNodes
 */
async function compareNodesInBackground(pubANodes: number[], pubBNodes: number[]): Promise<number> {
    return piscina.run({ pubANodes, pubBNodes }, {name: 'compareNodes'});
}

/**
 * Method which sends task to a worker thread (meta)
 * @param pubAMeta
 * @param pubBMeta
 */
async function compareMetaInBackground(pubAMeta: PublicationMeta, pubBMeta: PublicationMeta): Promise<ResultMeta> {
    return piscina.run({ pubA: pubAMeta, pubB: pubBMeta }, {name: 'compareMeta'});
}

/**
 * Method which sends task to a worker thread (files)
 * @param pubAFiles
 * @param pubBFiles
 */
async function compareFilesInBackground(pubAFiles: PrismaFile[], pubBFiles: PrismaFile[]): Promise<ResultFile> {
    return piscina.run({ pubAFiles, pubBFiles }, {name: 'compareFiles'});
}

/**
 * Method which sends task to a worker thread (complete initial parsing of uploaded/edited publication)
 * @param pubFiles
 */
async function initialMaterialFileParseInBackground(pubFiles: PrismaFile[]): Promise<FileTokenInfo> {
    return piscina.run({ pubFiles }, {name: 'initialParse'});
}

export async function enqueueMaterialComparison(publicationId: number, materialId: number): Promise<void> {
    try{
        const currentFiles: PrismaFile[] = await getFilesForMaterial(materialId)

        // INITIALLY PARSE CURRENT PUBLICATION FILES IN ORDER TO REUSE TOKENS LATER ON
        const initialParsing = await initialMaterialFileParseInBackground(currentFiles);

        await handleFileTokens(initialParsing)

        const materials = await getAllMaterials([],[],[],[],'','');
        const currentMaterial = await getMaterialByPublicationId(publicationId)
        const comparisons: {fromPubId: number, toPubId: number,
            similarityFile: Promise<ResultFile>, similarityMeta: Promise<ResultMeta>}[] = [];
        const filesToUpdatePrisma: FileTokenInfo = []

        const pubAMeta: PublicationMeta = {
            title: currentMaterial!.publication.title,
            description: currentMaterial!.publication.description,
            learningObjectives: currentMaterial!.publication.learningObjectives,
            prerequisites: currentMaterial!.publication.prerequisites,
            tags: currentMaterial!.publication.tags.map((tag: { content: string; }) => tag.content),
            difficulty: currentMaterial!.publication.difficulty
        }

        for (let i = 0; i < materials.length; i++) {
            if (materials[i].publicationId !== publicationId) {

                const pubBMeta: PublicationMeta = {
                    title: materials[i].publication.title,
                    description: materials[i].publication.description,
                    learningObjectives: materials[i].publication.learningObjectives,
                    prerequisites: materials[i].publication.prerequisites,
                    tags: materials[i].publication.tags.map((tag: { content: string; }) => tag.content),
                    difficulty: materials[i].publication.difficulty
                }

                // enqueue the task and push the promise to the comparisons array
                comparisons.push({
                    fromPubId: publicationId,
                    toPubId: materials[i].publicationId,
                    similarityFile: compareFilesInBackground(currentMaterial.files, materials[i].files),
                    similarityMeta: compareMetaInBackground(pubAMeta, pubBMeta)
                });
            }
        }

        const comparisonsResolved = await Promise.all(comparisons.map(async data => {
            const {similarity: fileSim, filesToUpdate: filesToUpdate} = await data.similarityFile
            const metaSim = await data.similarityMeta

            filesToUpdate.forEach(file => filesToUpdatePrisma.push(file))

            const similarity = 0.5 * fileSim +
                0.1*metaSim.title + 0.15*metaSim.description +
                0.09*metaSim.learningObjectives + 0.06*metaSim.prerequisites +
                0.07*metaSim.tags + 0.03*metaSim.difficulty

            return {
                fromPubId: data.fromPubId,
                toPubId: data.toPubId,
                similarity: similarity
            }
        }));

        await handleSimilarity(comparisonsResolved)

        await handleFileTokens(filesToUpdatePrisma)
    }
    catch (error){
        console.error('Error while doing comparisons');
        // 'error' is of type 'unknown' here, so we need a type guard.
        if (error instanceof Error) {
            console.error("Name:", error.name);
            console.error("Message:", error.message);
            console.error("Stack:", error.stack);
        } else {
            // if it's not an Error, just log it directly (or handle differently).
            console.error("Unknown error type:", error);
        }
    }
}

export async function enqueueCircuitComparison(publicationId: number): Promise<void> {
    try{
        const circuits = await getAllCircuits([], [], 0, '', '');
        const currentCircuit = await getCircuitByPublicationId(publicationId)
        const comparisons: {fromPubId: number, toPubId: number,
            similarityNode: Promise<number>, similarityMeta: Promise<ResultMeta>}[] = [];

        const pubAMeta: PublicationMeta = {
            title: currentCircuit!.publication.title,
            description: currentCircuit!.publication.description,
            learningObjectives: currentCircuit!.publication.learningObjectives,
            prerequisites: currentCircuit!.publication.prerequisites,
            tags: currentCircuit!.publication.tags.map((tag: { content: string; }) => tag.content),
            difficulty: currentCircuit!.publication.difficulty
        }

        for (let i = 0; i < circuits.length; i++) {
            if (circuits[i].publicationId !== publicationId) {

                const pubBMeta: PublicationMeta = {
                    title: circuits[i].publication.title,
                    description: circuits[i].publication.description,
                    learningObjectives: circuits[i].publication.learningObjectives,
                    prerequisites: circuits[i].publication.prerequisites,
                    tags: circuits[i].publication.tags.map((tag: { content: string; }) => tag.content),
                    difficulty: circuits[i].publication.difficulty
                }

                // enqueue the task and push the promise to the comparisons array
                comparisons.push({
                    fromPubId: publicationId,
                    toPubId: circuits[i].publicationId,
                    similarityNode: compareNodesInBackground(currentCircuit!.nodes.map(n => n.publicationId),
                        circuits[i].nodes.map(n => n.publicationId)),
                    similarityMeta: compareMetaInBackground(pubAMeta, pubBMeta)
                });
            }
        }

        const comparisonsResolved = await Promise.all(comparisons.map(async data => {
            const nodeSim = await data.similarityNode
            const metaSim = await data.similarityMeta

            const similarity = 0.5 * nodeSim +
                0.1*metaSim.title + 0.15*metaSim.description +
                0.09*metaSim.learningObjectives + 0.06*metaSim.prerequisites +
                0.07*metaSim.tags + 0.03*metaSim.difficulty

            return {
                fromPubId: data.fromPubId,
                toPubId: data.toPubId,
                similarity: similarity
            }
        }));

        await handleSimilarity(comparisonsResolved)
    }
    catch (error){
        console.error('Error while doing comparisons');
        // 'error' is of type 'unknown' here, so we need a type guard.
        if (error instanceof Error) {
            console.error("Name:", error.name);
            console.error("Message:", error.message);
            console.error("Stack:", error.stack);
        } else {
            // if it's not an Error, just log it directly (or handle differently).
            console.error("Unknown error type:", error);
        }
    }
}