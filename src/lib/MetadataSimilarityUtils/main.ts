import {calculateCosineSimilarity, model} from "$lib";
import type {Difficulty} from "@prisma/client";

/**
 * Method that compares similarity between title OR description
 * @param text1
 * @param text2
 */
export async function compareTitleOrDescription(text1: string, text2: string): Promise<number> {
    try {

        const data = await model.computeEmbeddings(text1, text2)

        return calculateCosineSimilarity(data.embeddingFirst, data.embeddingSecond)
    } catch (error) {
        console.error('Error while comparing metadata (title/desc):', error);
        return 0;
    }
}

/**
 * Method that compares similarity between prerequisites OR learning objectives
 * @param text1
 * @param text2
 */
export async function comparePrereqOrLO(text1: string[], text2: string[]): Promise<number> {
    try {
        const data = await model.computeEmbeddings(text1.join(". "), text2.join(". "))

        return calculateCosineSimilarity(data.embeddingFirst, data.embeddingSecond)
    } catch (error) {
        console.error('Error while comparing metadata (lo/prereq):', error);
        return 0;
    }
}

export async function compareDifficulties(pubADifficulty: Difficulty, pubBDifficulty: Difficulty) {
    switch(pubADifficulty){
        case "easy":
            if (pubBDifficulty === "easy") return 1
            if (pubBDifficulty === "medium") return 0.5
            if (pubBDifficulty === "hard") return 0
            else return 0 // TODO: handle case better

        case "medium":
            if (pubBDifficulty === "easy") return 0.5
            if (pubBDifficulty === "medium") return 1
            if (pubBDifficulty === "hard") return 0.5
            else return 0 // TODO: handle case better

        case "hard":
            if (pubBDifficulty === "easy") return 0
            if (pubBDifficulty === "medium") return 0.5
            if (pubBDifficulty === "hard") return 1
            else return 0 // TODO: handle case better

    }
}

/**
 * Method that computes the Jaccard similarity
 * Primarily used for tags, could be used for circuits
 * @param data1
 * @param data2
 */
export async function jaccardComparison(data1: any[], data2: any[]): Promise<number> {
    try {
        const set1Unique = new Set(data1);
        const set2Unique = new Set(data2);

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