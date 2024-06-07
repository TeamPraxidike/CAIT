import pkg from 'natural';
//import {performance} from "node:perf_hooks";

const stopwords = pkg.stopwords;
const tokenizer = new pkg.WordTokenizer();
const stemmer = pkg.PorterStemmer
const ni = new pkg.NounInflector();
//const present = new pkg.PresentVerbInflector();

/**
 * Preprocesses and tokenizes text, used for TF-IDF
 * @param text
 */
export function preprocessText(text: string): string[] {
    // trim the string to remove leading and trailing whitespace
    const trimmedStr = text.trim();

    // replace multiple spaces with a single space
    const cleanedStr = trimmedStr.replace(/\s+/g, ' ');

    // replace every character that is NOT a letter with the empty string.
    let filteredText = cleanedStr.replace(/[^A-Za-z ]+/g, ' ')

    filteredText = filteredText.toLowerCase()

    // tokenize
    let tokens = tokenizer.tokenize(filteredText);

    // filter out stopwords
    tokens = tokens.filter(token => {
        return !stopwords.includes(token);
    })

    // singularize nouns
    tokens = tokens.map(token => ni.singularize(token))

    // exclude 1-letter tokens
    tokens = tokens.filter(token => token.length > 1)

    //get stems
    tokens = tokens.map(token => stemmer.stem(token))

    return tokens;
}

/**
 * Calculates the TF-IDF between two strings
 * @param text1
 * @param text2
 */
export function calculateTfIdf(text1: string, text2: string): [number[], number[]] {
    const tfIdf = new pkg.TfIdf();

    const procText1 = preprocessText(text1);
    const procText2 = preprocessText(text2);

    tfIdf.addDocument(procText1);
    tfIdf.addDocument(procText2);

    const dictionary = new Set<string>();
    tfIdf.listTerms(0).forEach(term => dictionary.add(term.term));
    tfIdf.listTerms(1).forEach(term => dictionary.add(term.term));

    const vector1 = Array.from(dictionary).map(term => tfIdf.tfidf(term, 0))
    const vector2 = Array.from(dictionary).map(term => tfIdf.tfidf(term, 1))

    return [vector1, vector2];
}

/**
 * Calculates the cosine similarity between two vectors.
 * @param vector1 - First vector
 * @param vector2 - Second vector
 * @returns The cosine similarity between vector1 and vector2
 */
export function calculateCosineSimilarity(vector1: number[], vector2: number[]): number {
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

    if (dotProduct === 0) return 0
    if (magnitude1 === 0 || magnitude2 === 0) {
        return 0; // Avoid division by zero
    }

    return (dotProduct / (magnitude1 * magnitude2));
}
