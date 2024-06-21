// //import { performance } from "node:perf_hooks";
// import { stopwords, WordTokenizer, PorterStemmer, NounInflector, TfIdf } from 'natural'

import pkg from 'natural';
const { stopwords, WordTokenizer, PorterStemmer, NounInflector, TfIdf } = pkg;

const tokenizer = new WordTokenizer();
const stemmer = PorterStemmer;
const ni = new NounInflector();
//const present = new pkg.PresentVerbInflector();

/**
 * Preprocesses and tokenizes text, used for TF-IDF
 * @param {string} text
 * @returns {string}
 */
export function preprocessText(text) {
    // trim the string to remove leading and trailing whitespace
    const trimmedStr = text.trim();

    // replace multiple spaces with a single space
    const cleanedStr = trimmedStr.replace(/\s+/g, ' ');

    // replace every character that is NOT a letter with the empty string.
    let filteredText = cleanedStr.replace(/[^A-Za-z ]+/g, ' ');

    filteredText = filteredText.toLowerCase();

    // tokenize
    let tokens = tokenizer.tokenize(filteredText);

    // filter out stopwords
    tokens = tokens.filter(token => {
        return !stopwords.includes(token);
    });

    // singularize nouns
    tokens = tokens.map(token => ni.singularize(token));

    // exclude 1-letter tokens
    tokens = tokens.filter(token => token.length > 1);

    // get stems
    tokens = tokens.map(token => stemmer.stem(token));

    return tokens.join(' ');
}

/**
 * Calculates the TF-IDF between two strings
 * @param {string} text1
 * @param {string} text2
 * @returns {[number[], number[]]}
 */
export function calculateTfIdf(text1, text2) {
    const tfIdf = new TfIdf();

    // const procText1 = preprocessText(text1);
    // const procText2 = preprocessText(text2);

    // BYPASS 'natural' preprocessor (using string[] instead of string)
    const procText1 = text1.split(" ");
    const procText2 = text2.split(" ");

    tfIdf.addDocument(procText1);
    tfIdf.addDocument(procText2);

    const dictionary = new Set();
    tfIdf.listTerms(0).forEach(term => dictionary.add(term.term));
    tfIdf.listTerms(1).forEach(term => dictionary.add(term.term));

    const vector1 = Array.from(dictionary).map(term => tfIdf.tfidf(term, 0));
    const vector2 = Array.from(dictionary).map(term => tfIdf.tfidf(term, 1));

    return [vector1, vector2];
}
