// import type {Difficulty, File as PrismaFile} from "@prisma/client"
// import {compare} from "$lib/FileSimilarityUtils/main";
// import {
//     compareDifficulties,
//     comparePrereqOrLO,
//     compareTitleOrDescription,
//     jaccardComparison
// } from "$lib/MetadataSimilarityUtils/main";
// import {fileURLToPath} from "node:url";
// import path from "path";
//
// export type PublicationMeta = {
//     title: string;
//     description: string;
//     learningObjectives: string[];
//     prerequisites: string[];
//     tags: string[];
//     difficulty: Difficulty
// };
//
// export type ResultMeta = {
//     title: number;
//     description: number;
//     learningObjectives: number;
//     prerequisites: number;
//     tags: number;
//     difficulty: number;
// };
//
// //export const filename = path.resolve(__filename);
//
// //export const filename = path.resolve(fileURLToPath(import.meta.url));
//
//
// /**
//  * Does jaccard similarity on two lists of publication ids (contained within a node)
//  * @param pubANodes
//  * @param pubBNodes
//  */
// async function compareNodes(pubANodes: number[], pubBNodes: number[]){
//     return jaccardComparison(pubANodes, pubBNodes)
// }
//
// async function compareFiles(pubAFiles: PrismaFile[], pubBFiles: PrismaFile[]) {
//     return compare(pubAFiles, pubBFiles);
// }
//
// async function compareMeta(pubA: PublicationMeta, pubB: PublicationMeta): Promise<ResultMeta> {
//     const titleComparison = await compareTitleOrDescription(pubA.title, pubB.title);
//     const descriptionComparison = await compareTitleOrDescription(pubA.description, pubB.description);
//     const losComparison = await comparePrereqOrLO(pubA.learningObjectives, pubB.learningObjectives);
//     const prerequisitesComparison = await comparePrereqOrLO(pubA.prerequisites, pubB.prerequisites);
//     const tagsComparison = await jaccardComparison(pubA.tags, pubB.tags);
//     const difficultyComparison = await compareDifficulties(pubA.difficulty, pubB.difficulty)
//
//     return {
//         title: titleComparison,
//         description: descriptionComparison,
//         learningObjectives: losComparison,
//         prerequisites: prerequisitesComparison,
//         tags: tagsComparison,
//         difficulty: difficultyComparison
//     };
// }
//
//
// const methods  = {
//     compareFiles,
//     compareMeta,
//     compareNodes
// }
//
// export default methods
