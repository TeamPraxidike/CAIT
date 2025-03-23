import { calculateCosineSimilarity, model} from "../similarityIndex.mjs";

/**
 * Method that compares similarity between title OR description
 * @param {string} text1
 * @param {string} text2
 * @returns {Promise<number>}
 */
export async function compareTitleOrDescription(text1, text2) {
    try {
        const data = await model.computeEmbeddingsTextPair(text1, text2);
        return calculateCosineSimilarity(data.embeddingFirst, data.embeddingSecond);
    } catch (error) {
        console.error('Error while comparing metadata (title/desc):', error);
        return 0;
    }
}

/**
 * Method that compares similarity between prerequisites OR learning objectives
 * @param {string[]} text1
 * @param {string[]} text2
 * @returns {Promise<number>}
 */
export async function comparePrereqOrLO(text1, text2) {
    try {
        const data = await model.computeEmbeddingsTextPair(text1.join('. '), text2.join('. '));
        return calculateCosineSimilarity(data.embeddingFirst, data.embeddingSecond);
    } catch (error) {
        console.error('Error while comparing metadata (lo/prereq):', error);
        return 0;
    }
}

/**
 * Method that compares difficulties
 * @param {string} pubADifficulty
 * @param {string} pubBDifficulty
 * @returns {number}
 */
export async function compareDifficulties(pubADifficulty, pubBDifficulty) {
    switch (pubADifficulty) {
        case 'easy':
            if (pubBDifficulty === 'easy') return 1;
            if (pubBDifficulty === 'medium') return 0.5;
            if (pubBDifficulty === 'hard') return 0;
            else return 0; // TODO: handle case better

        case 'medium':
            if (pubBDifficulty === 'easy') return 0.5;
            if (pubBDifficulty === 'medium') return 1;
            if (pubBDifficulty === 'hard') return 0.5;
            else return 0; // TODO: handle case better

        case 'hard':
            if (pubBDifficulty === 'easy') return 0;
            if (pubBDifficulty === 'medium') return 0.5;
            if (pubBDifficulty === 'hard') return 1;
            else return 0; // TODO: handle case better

        default:
            return 0; // TODO: handle case better
    }
}

/**
 * Method that computes the Jaccard similarity
 * Primarily used for tags, could be used for circuits
 * @param {any[]} data1
 * @param {any[]} data2
 * @returns {Promise<number>}
 */
export async function jaccardComparison(data1, data2) {
    try {
        // const set1Unique = new Set(data1);
        // const set2Unique = new Set(data2);

        const set1Unique = data1 ? new Set(data1) : new Set();
        const set2Unique = data2 ? new Set(data2) : new Set();

        // calculate intersection
        const intersection = new Set([...set1Unique].filter(str => set2Unique.has(str)));

        // calculate union
        const union = new Set([...set1Unique, ...set2Unique]);

        // Jaccard similarity
        return intersection.size / union.size;
    } catch (error) {
        console.error('Error while comparing metadata (tags/circuits):', error);
        return 0;
    }
}
