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

    console.log("\nIN COMPARE FILES\n")
    for (const pubAFile of pubAFiles) {console.log(pubAFile)}
    console.log("--------------")
    for (const pubBFile of pubBFiles) {console.log(pubBFile)}
    console.log("--------------")
    return (pubAFiles && pubBFiles) ? compare(pubAFiles, pubBFiles) : 0;
}

/**
 * Compares two sets of publication metadata
 * @param {Object} pubA
 * @param {Object} pubB
 * @returns {Promise<Object>}
 */
export async function compareMeta({pubA, pubB}) {
    // const titleComparison = await compareTitleOrDescription(pubA.title, pubB.title);
    // const descriptionComparison = await compareTitleOrDescription(pubA.description, pubB.description);
    // const losComparison = await comparePrereqOrLO(pubA.learningObjectives, pubB.learningObjectives);
    // const prerequisitesComparison = await comparePrereqOrLO(pubA.prerequisites, pubB.prerequisites);
    // const tagsComparison = await jaccardComparison(pubA.tags, pubB.tags);
    // const difficultyComparison = compareDifficulties(pubA.difficulty, pubB.difficulty);

    console.log(`\nPUB A COMPARE META HELPER:
                \n${pubA.title}
                \n${pubA.description}
                \n${pubA.learningObjectives}
                \n${pubA.prerequisites}
                \n${pubA.tags}
                \n${pubA.difficulty}\n------------------------\n`);

    console.log(`PUB B COMPARE META HELPER:
                \n${pubB.title}
                \n${pubB.description}
                \n${pubB.learningObjectives}
                \n${pubB.prerequisites}
                \n${pubB.tags}
                \n${pubB.difficulty}`);

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

    console.log(`\nDONE COMPARING METADATA\n${title}\n${description}
    \n${learningObjectives}\n${prerequisites}\n${tags}\n${difficulty}\n`);


    return {
        title,
        description,
        learningObjectives,
        prerequisites,
        tags,
        difficulty
    };


    // return {
    //     title: titleComparison,
    //     description: descriptionComparison,
    //     learningObjectives: losComparison,
    //     prerequisites: prerequisitesComparison,
    //     tags: tagsComparison,
    //     difficulty: difficultyComparison
    // };
}

// Create an object that holds references to the functions
const handlers = {
    compareNodes,
    compareFiles,
    compareMeta,
};

// Export the object as the default export
export default handlers;

// Export methods as a default object
// export default {
//     compareFiles,
//     compareMeta,
//     compareNodes
// };
