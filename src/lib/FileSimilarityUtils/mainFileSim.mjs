import { calculateCosineSimilarity} from "../similarityIndex.mjs";
import { reader } from './readerJS.mjs';
import { calculateTfIdf } from './textProcessorJs.mjs';
import path from 'path';
//import { basePath } from '$lib/database';

const basePath = path.join('static', 'uploadedFiles');

/**
 * Main method that returns the similarity between two sets of files
 * @param {Array} pubAFiles
 * @param {Array} pubBFiles
 * @returns {Promise<number>}
 */
export async function compare(pubAFiles, pubBFiles) {
    try {
        //const start = performance.now();

        const pubAText = Array.isArray(pubAFiles) ? await getPubText(pubAFiles) : new Set();
        const pubBText = Array.isArray(pubBFiles) ? await getPubText(pubBFiles) : new Set();

        const combinedList = Array.from(new Set([...pubAText, ...pubBText]))
            .sort((first, second) => (first > second ? -1 : 1));

        // create the matrix
        const matrix = [];

        // fill matrix with -1
        for (let i = 0; i < combinedList.length; i++) {
            matrix[i] = Array(combinedList.length).fill(-1);
        }

        // calculate possible connections
        for (let i = 0; i < combinedList.length; i++) {
            if (!pubAText.has(combinedList[i])) continue;

            for (let j = 0; j < combinedList.length; j++) {
                if (!pubBText.has(combinedList[j])) continue;

                const [vector1, vector2] = calculateTfIdf(combinedList[i], combinedList[j]);
                matrix[i][j] = calculateCosineSimilarity(vector1, vector2);
                matrix[j][i] = matrix[i][j];
            }
        }

        let similarity = 0;
        const similarityArr = [];

        // get the biggest similarity in each column
        for (let i = 0; i < combinedList.length; i++) {
            let biggest = -1;
            let usedI = 0;
            let usedJ = 0;
            for (let j = 0; j < combinedList.length; j++) {
                if (matrix[j][i] > biggest) {
                    biggest = matrix[j][i];
                    usedI = i;
                    usedJ = j;
                }
            }
            if (biggest !== -1) {
                similarityArr.push(biggest);
                // remove connection
                matrix[usedI][usedJ] = -1;
                matrix[usedJ][usedI] = -1;
            }
        }

        // the weight assigned to each similarity will follow the curve
        // y = 2x^2 - 2x + 1.5 (only within the range x e [0, 0.5)
        // y = 6x^2 - 6x + 2.5 (only within the range x e [0.5, 1]

        // get weights
        const weights = similarityArr.map(value => {
            if (value < 0.5) return 2 * Math.pow(value, 2) - 2 * value + 1.5;
            else return 6 * Math.pow(value, 2) - 6 * value + 2.5;
        });

        // sum weights
        const sumWeights = weights.reduce((a, b) => a + b);

        let weightedSimilarities = 0;

        for (let i = 0; i < similarityArr.length; i++) {
            weightedSimilarities += similarityArr[i] * weights[i];
        }

        // no need to update average
        if (sumWeights === 0 || weightedSimilarities === 0) {
            similarity = 0;
        } else similarity = Number((weightedSimilarities / sumWeights).toPrecision(3));

        //console.log(`\n\nCosine Similarity: ${similarity}\n\n`);

        return similarity;

        // const end = performance.now();
        //
        // console.log(`took ${end - start}`)
    } catch (error) {
        console.error('Error reading PDFs:', error);
        return 0;
    }
}

/**
 * Helper method that reads text from a list of File entities
 * @param {Array} pubFiles
 * @returns {Promise<Set<string>>}
 */
async function getPubText(pubFiles) {
    const pubAPromises = pubFiles.map(file => reader(path.join(basePath, file.path)));
    const pubAContents = await Promise.all(pubAPromises);
    const validContents = pubAContents.filter(content => content !== null);

    return new Set(validContents);
}
