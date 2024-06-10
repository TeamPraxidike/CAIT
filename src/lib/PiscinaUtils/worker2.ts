import workerpool from 'workerpool';
import { compare } from "$lib/FileSimilarityUtils/main";
import {
    compareDifficulties,
    comparePrereqOrLO,
    compareTitleOrDescription,
    jaccardComparison
} from "$lib/MetadataSimilarityUtils/main";
import type { Difficulty, File as PrismaFile } from "@prisma/client";

export type PublicationMeta = {
    title: string;
    description: string;
    learningObjectives: string[];
    prerequisites: string[];
    tags: string[];
    difficulty: Difficulty;
};

export type ResultMeta = {
    title: number;
    description: number;
    learningObjectives: number;
    prerequisites: number;
    tags: number;
    difficulty: number;
};

async function compareNodes(pubANodes: number[], pubBNodes: number[]): Promise<number> {
    return jaccardComparison(pubANodes, pubBNodes);
}

async function compareFiles(pubAFiles: PrismaFile[], pubBFiles: PrismaFile[]): Promise<number> {
    return compare(pubAFiles, pubBFiles);
}

async function compareMeta(pubA: PublicationMeta, pubB: PublicationMeta): Promise<ResultMeta> {
    const titleComparison = await compareTitleOrDescription(pubA.title, pubB.title);
    const descriptionComparison = await compareTitleOrDescription(pubA.description, pubB.description);
    const losComparison = await comparePrereqOrLO(pubA.learningObjectives, pubB.learningObjectives);
    const prerequisitesComparison = await comparePrereqOrLO(pubA.prerequisites, pubB.prerequisites);
    const tagsComparison = await jaccardComparison(pubA.tags, pubB.tags);
    const difficultyComparison = await compareDifficulties(pubA.difficulty, pubB.difficulty);

    return {
        title: titleComparison,
        description: descriptionComparison,
        learningObjectives: losComparison,
        prerequisites: prerequisitesComparison,
        tags: tagsComparison,
        difficulty: difficultyComparison
    };
}

workerpool.worker({
    compareNodes,
    compareFiles,
    compareMeta
});