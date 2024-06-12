import Piscina from 'piscina';
import path, { join } from 'path';
import {
    getAllCircuits,
    getAllMaterials,
    getCircuitByPublicationId,
    getMaterialByPublicationId,
    handleSimilarity
} from "$lib/database";
import type {Difficulty, File as PrismaFile} from "@prisma/client";
import {type PublicationMeta, type ResultMeta} from "$lib/PiscinaUtils/worker";
import { dirname } from 'path';
import {fileURLToPath} from "node:url";

const piscina = new Piscina({
    filename: new URL('./workerJS.mjs', import.meta.url).href,
    maxThreads: 1 // max number of threads
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
async function compareFilesInBackground(pubAFiles: PrismaFile[], pubBFiles: PrismaFile[]): Promise<number> {
    return piscina.run({ pubAFiles, pubBFiles }, {name: 'compareFiles'});
}

export async function enqueueMaterialComparison(publicationId: number): Promise<void> {
    try{
        const materials = await getAllMaterials([],[],[],[],'','');
        const currentMaterial = await getMaterialByPublicationId(publicationId)
        const comparisons: {fromPubId: number, toPubId: number,
            similarityFile: Promise<number>, similarityMeta: Promise<ResultMeta>}[] = [];

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

                console.log(`\nPUB A META:
                \n${pubAMeta.title}
                \n${pubAMeta.description}
                \n${pubAMeta.learningObjectives}
                \n${pubAMeta.prerequisites}
                \n${pubAMeta.tags}
                \n${pubAMeta.difficulty}\n------------------------\n`);

                console.log(`PUB B META:
                \n${pubBMeta.title}
                \n${pubBMeta.description}
                \n${pubBMeta.learningObjectives}
                \n${pubBMeta.prerequisites}
                \n${pubBMeta.tags}
                \n${pubBMeta.difficulty}`);

                // enqueue the task and push the promise to the comparisons array
                comparisons.push({
                    fromPubId: publicationId,
                    toPubId: materials[i].publicationId,
                    similarityFile: compareFilesInBackground(currentMaterial.files, materials[i].files),
                    similarityMeta: compareMetaInBackground(pubAMeta, pubBMeta)
                });
            }
        }

        console.log("\n\nAFTER FOR LOOP\n\n")

        const comparisonsResolved = await Promise.all(comparisons.map(async data => {
            console.log("\nBEFORE AWAITING IN RESOLVED\n")
            const fileSim = await data.similarityFile
            const metaSim = await data.similarityMeta

            console.log(`\nSIMILARITIES:
                \n${fileSim}
                \n${metaSim.title}
                \n${metaSim.description}
                \n${metaSim.learningObjectives}
                \n${metaSim.prerequisites}
                \n${metaSim.tags}
                \n${metaSim.difficulty}`);


            const similarity = 0.5 * fileSim +
                0.1*metaSim.title + 0.15*metaSim.description +
                0.09*metaSim.learningObjectives + 0.06*metaSim.prerequisites +
                0.07*metaSim.tags + 0.03*metaSim.difficulty

            console.log(`\nFINAL SIM: ${similarity}`)

            return {
                fromPubId: data.fromPubId,
                toPubId: data.toPubId,
                similarity: similarity
            }
        }));

        await handleSimilarity(comparisonsResolved)
    }
    catch (error){
        console.error("Error while doing comparisons\n" + error)
    }
}

export async function enqueueCircuitComparison(publicationId: number): Promise<void> {
    try{
        const circuits = await getAllCircuits([], [], 3, '', '');
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
        console.error("Error while doing comparisons\n" + error)
    }
}