import Piscina from 'piscina';
import { join } from 'path';
import {getAllMaterials, getMaterialByPublicationId, handleSimilarity} from "$lib/database";
import type {File as PrismaFile} from "@prisma/client";

const piscina = new Piscina({
    filename: join(__dirname, 'worker.ts'), // link worker file
    maxThreads: 4 // max number of threads
});

/**
 * Method which sends task to a worker thread
 * @param pubAFiles
 * @param pubBFiles
 */
async function compareFilesInBackground(pubAFiles: PrismaFile[], pubBFiles: PrismaFile[]): Promise<number> {
    return piscina.run({ pubAFiles, pubBFiles }, {name: 'compareFiles'});
}

export async function enqueueComparisonTasks(publicationId: number): Promise<void> {
    try{
        const materials = await getAllMaterials([],[],[],[],'','');
        const currentMaterial = await getMaterialByPublicationId(publicationId)
        const comparisons: {fromPubId: number, toPubId: number, similarity: Promise<number>}[] = [];

        for (let i = 0; i < materials.length; i++) {
            if (materials[i].publicationId !== publicationId) {
                // enqueue the task and push the promise to the comparisons array
                comparisons.push({
                    fromPubId: publicationId,
                    toPubId: materials[i].publicationId,
                    similarity: compareFilesInBackground(currentMaterial.files, materials[i].files)
                });
            }
        }

        const comparisonsResolved: {fromPubId: number, toPubId: number, similarity: number}[] = await Promise.all(comparisons.map(async data => ({
            fromPubId: data.fromPubId,
            toPubId: data.toPubId,
            similarity: await data.similarity
        })));

        await handleSimilarity(comparisonsResolved)
    }
    catch (error){
        console.error("Error while doing comparisons\n" + error)
    }
}