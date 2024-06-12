import {compare} from "../FileSimilarityUtils/mainFileSim.mjs";
import {
    compareDifficulties,
    comparePrereqOrLO,
    compareTitleOrDescription,
    jaccardComparison
} from '../MetadataSimilarityUtils/similarityUtilsJS.mjs';

/**
 * Does jaccard similarity on two lists of publication ids (contained within a node)
 * @param {number[]} pubANodes
 * @param {number[]} pubBNodes
 * @returns {Promise<number>}
 */
export async function compareNodes({pubANodes, pubBNodes}) {
    // return jaccardComparison(pubANodes, pubBNodes);
    return (pubANodes && pubBNodes) ? jaccardComparison(pubANodes, pubBNodes) : 0;
}

/**
 * Compares two sets of files
 * @param {Array} pubAFiles
 * @param {Array} pubBFiles
 * @returns {Promise<any>}
 */
export async function compareFiles({pubAFiles, pubBFiles}) {
    // return compare(pubAFiles, pubBFiles);
    return (pubAFiles && pubBFiles) ? compare(pubAFiles, pubBFiles) : 0;
}

/**
 * Compares two sets of publication metadata
 * @param {Object} pubA
 * @param {Object} pubB
 * @returns {Promise<Object>}
 */
export async function compareMeta({pubA, pubB}) {
    const titleComparison = (pubA.title && pubB.title) ? compareTitleOrDescription(pubA.title, pubB.title) : 0;
    const descriptionComparison = (pubA.description && pubB.description) ? compareTitleOrDescription(pubA.description, pubB.description) : 0;
    const losComparison = (pubA.learningObjectives && pubB.learningObjectives) ? comparePrereqOrLO(pubA.learningObjectives, pubB.learningObjectives) : 0;
    const prerequisitesComparison = (pubA.prerequisites && pubB.prerequisites) ? comparePrereqOrLO(pubA.prerequisites, pubB.prerequisites) : 0;
    const tagsComparison = (pubA.tags && pubB.tags) ? jaccardComparison(pubA.tags, pubB.tags) : 0;
    const difficultyComparison = (pubA.difficulty && pubB.difficulty) ? compareDifficulties(pubA.difficulty, pubB.difficulty) : 0;

    const [
        title,
        description,
        learningObjectives,
        prerequisites,
        tags,
        difficulty
    ] = await Promise.all([
        titleComparison,
        descriptionComparison,
        losComparison,
        prerequisitesComparison,
        tagsComparison,
        difficultyComparison
    ]);


    return {
        title,
        description,
        learningObjectives,
        prerequisites,
        tags,
        difficulty
    };
}

// Create an object that holds references to the functions
const handlers = {
    compareNodes,
    compareFiles,
    compareMeta,
};

// Export the object as the default export
export default handlers;
