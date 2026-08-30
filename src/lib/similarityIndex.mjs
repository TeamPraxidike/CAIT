import SBERTSingleton from "./MetadataSimilarityUtils/SBERTSingleton.mjs";

// Loading the transformer model is intentionally deferred until a similarity
// operation is actually requested.  Import-time model loading made every SSR
// build (including the integration-test preview build) reach out to
// HuggingFace, even when semantic search was never used.
let modelPromise;

function getModel() {
    modelPromise ??= SBERTSingleton.getInstance();
    return modelPromise;
}

export const model = {
    computeEmbeddingsTextPair(...args) {
        return getModel().then(instance => instance.computeEmbeddingsTextPair(...args));
    },
    computeEmbeddingSingleText(...args) {
        return getModel().then(instance => instance.computeEmbeddingSingleText(...args));
    },
};

/**
 * Calculates the cosine similarity between two vectors.
 * @param {number[]} vector1 - First vector
 * @param {number[]} vector2 - Second vector
 * @returns {number} The cosine similarity between vector1 and vector2
 */
export function calculateCosineSimilarity(vector1, vector2) {
    if (vector1.length !== vector2.length) {
        throw new Error("Vectors must be of the same length");
    }

    let dotProduct = 0;
    let magnitude1 = 0;
    let magnitude2 = 0;

    for (let i = 0; i < vector1.length; i++) {
        dotProduct += vector1[i] * vector2[i];
        magnitude1 += vector1[i] * vector1[i];
        magnitude2 += vector2[i] * vector2[i];
    }

    magnitude1 = Math.sqrt(magnitude1);
    magnitude2 = Math.sqrt(magnitude2);

    if (dotProduct === 0) return 0;
    if (magnitude1 === 0 || magnitude2 === 0) {
        return 0; // Avoid division by zero
    }

    return (dotProduct / (magnitude1 * magnitude2));
}
