import {calculateCosineSimilarity} from "../similarityIndex.mjs";
import {reader} from './reader.mjs';
import {calculateTfIdf, preprocessText} from './textProcessor.mjs';
import path from 'path';

//const basePath = path.join('static', 'uploadedFiles');
//const basePath = "uploadedFiles"
//const basePath = path.join("docker", "volumes", "storage", "uploadedFiles")

/**
 * Main method that returns the similarity between two sets of files
 * @param {Array} pubAFiles
 * @param {Array} pubBFiles
 */
export async function compare(pubAFiles, pubBFiles) {
    try {
        let filesToUpdateA
        let pubAText = new Set()
        let filesToUpdateB
        let pubBText = new Set()


        if (Array.isArray(pubAFiles)) {
            const resultA = await getPubText(pubAFiles);
            ({ finalText: pubAText, filesToUpdate: filesToUpdateA } = resultA);
        }

        if (Array.isArray(pubBFiles)) {
            const resultB = await getPubText(pubBFiles);
            ({ finalText: pubBText, filesToUpdate: filesToUpdateB } = resultB);
        }


        //const pubAText = Array.isArray(pubAFiles) ? await getPubText(pubAFiles) : new Set();
        //const pubBText = Array.isArray(pubBFiles) ? await getPubText(pubBFiles) : new Set();

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
        const sumWeights = weights.reduce((a, b) => a + b, 0);

        let weightedSimilarities = 0;

        for (let i = 0; i < similarityArr.length; i++) {
            weightedSimilarities += similarityArr[i] * weights[i];
        }

        // no need to update average
        if (sumWeights === 0 || weightedSimilarities === 0) {
            similarity = 0;
        } else similarity = Number((weightedSimilarities / sumWeights).toPrecision(3));

        return {
            similarity: similarity,
            filesToUpdate: Array.from([...filesToUpdateA, ...filesToUpdateB])
        };

    } catch (error) {
        console.error('Error comparing files:', error);
        return {
            similarity: 0,
            filesToUpdate: []
        };
    }
}

/**
 * Helper method that reads text from a list of File entities
 * @param {Array} pubFiles
 */
export async function getPubText(pubFiles) {
    for (let i = 0; i<pubFiles.length; i++){
        if (pubFiles[i].text) {
            // file.text could be undefined/null in Prisma, otherwise we have info
            pubFiles[i] = {filePath: pubFiles[i].path, tokens: pubFiles[i].text, skip: true}
        } else {
            // returns Promise<string> or Promise<null>, need to await to avoid sudden memory spikes
            // const createdTokens = await reader(path.join(basePath, pubFiles[i].path))
            //const createdTokens = await reader(pubFiles[i].path)
            const { text: createdTokens, chunks: fileChunks } = await reader(pubFiles[i].path)
            // pubFiles[i] = {filePath: pubFiles[i].path, tokens: createdTokens, skip: false}
            pubFiles[i] = {filePath: pubFiles[i].path, tokens: createdTokens, skip: false, chunks: fileChunks}
        }
    }

    // if file is not considered for parsing
    const validContents = pubFiles.filter(content => content.tokens !== null);

    const finalText = new Set()
    const filesToUpdate = []

     validContents.forEach(content => {
        // if file has not undergone parsing before
        if (content.skip === false){
            const text = preprocessText(content.tokens)
            finalText.add(text)
            filesToUpdate.push({filePath: content.filePath, tokens: text, chunks: content.chunks})
        }
        // otherwise we already have the tokens, skip it
        else finalText.add(content.tokens);
    });

    return {
        finalText: finalText,
        filesToUpdate: filesToUpdate
    }
}
