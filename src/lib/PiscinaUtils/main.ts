import Piscina from 'piscina';
import { join } from 'path';
import {getAllMaterials, getMaterialByPublicationId} from "$lib/database";
import type {File as PrismaFile} from "@prisma/client";

const piscina = new Piscina({
    filename: join(__dirname, 'worker.js'), // link worker file
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
    const materials = await getAllMaterials([],[],[],[],'','');
    const currentMaterial = await getMaterialByPublicationId(publicationId)
    const comparisons: Promise<number>[] = [];

    for (let i = 0; i < materials.length; i++) {
        if (materials[i].publicationId !== publicationId) {
            // enqueue the task and push the promise to the comparisons array
            comparisons.push(compareFilesInBackground(currentMaterial.files, materials[i].files));
        }
    }

    const results = await Promise.all(comparisons);
    console.log('Comparison Results:', results);
}