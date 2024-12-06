import fs from 'fs';
import { getTextExtractor } from 'office-text-extractor';
import WordExtractor from 'word-extractor';
import removeMd from 'remove-markdown';
import { pythonKeywords } from './pythonKeywords.mjs';
//import {fileSystem} from '$lib/database/index.js';

export async function reader(filePath) {
    switch(filePath.split('.').pop()) {
        case 'txt':
            return txtReader(filePath);

        case 'md':
            return mdReader(filePath);

        case 'ipynb':
            return ipynbReader(filePath);

        case 'py':
            return pyReader(filePath);

        case 'doc':
        case 'docx':
            return wordReader(filePath);

        case 'pdf':
        case 'pptx':
        case 'xlsx':
            return officeReader(filePath);

        default:
            return null;
    }
}

/**
 * Read .txt file
 * @param {string} filePath
 * @returns {Promise<string>}
 */
export async function txtReader(filePath) {
    try {
        return fs.readFileSync(filePath).toString('utf8');
        //return fileSystem.readFile(filePath).toString('utf8')
    } catch (err) {
        console.error('Error reading the file:', err);
        return '';
    }
}

/**
 * Read .md file
 * @param {string} filePath
 * @returns {Promise<string>}
 */
export async function mdReader(filePath) {
    try {
        const text = fs.readFileSync(filePath).toString('utf8');
        //const text = fileSystem.readFile(filePath).toString('utf8');
        return removeMd(text);
    } catch (err) {
        console.error('Error reading the file:', err);
        return '';
    }
}

/**
 * Helper method which extracts text from code
 * @param {string} source
 * @returns {string}
 */
export function pythonCodeParser(source) {
    let textContent = '';

    const filteredSource = source
        .replace(/[^A-Za-z ]+/g, ' ')
        .trim()
        .split(/\s+/);

    for (const str of filteredSource) {
        // filter out keywords
        if (!pythonKeywords.has(str)) {
            textContent += ' ' + removeMd(str);
        }
    }

    return textContent;
}

/**
 * Read .py file
 * @param {string} filePath
 * @returns {Promise<string>}
 */
export async function pyReader(filePath) {
    try {
        const code = fs.readFileSync(filePath).toString('utf8');
        //const code = fileSystem.readFile(filePath).toString('utf8');
        return pythonCodeParser(code);
    } catch (err) {
        console.error('Error reading the file:', err);
        return '';
    }
}

/**
 * Read .ipynb file
 * @param {string} filePath
 * @returns {Promise<string>}
 */
export async function ipynbReader(filePath) {
    try {
        const data = fs.readFileSync(filePath).toString('utf8');
        //const data = fileSystem.readFile(filePath).toString('utf8');

        // check if the data is an empty string
        if (!data || data.trim() === '') {
            return '';
        }

        const notebook = JSON.parse(data);

        let textContent = '';

        notebook.cells.forEach((cell) => {
            if (typeof cell.source === 'string') {
                if (cell.cell_type === 'markdown') {
                    textContent += '\n' + removeMd(cell.source);
                } else if (cell.cell_type === 'code') {
                    const content = pythonCodeParser(cell.source);
                    textContent += '\n' + content;
                }
            } else {
                if (cell.cell_type === 'markdown') {
                    for (const str of cell.source) {
                        textContent += '\n' + removeMd(str);
                    }
                } else if (cell.cell_type === 'code') {
                    const content = pythonCodeParser(cell.source.join('\n'));
                    textContent += '\n' + content;
                }
            }
        });

        return textContent;
    } catch (err) {
        console.error('Error reading the file:', err);
        return '';
    }
}

/**
 * Read .doc and .docx files
 * @param {string} filePath
 * @returns {Promise<string>}
 */
export async function wordReader(filePath) {
    const extractor = new WordExtractor();
    try {
        const doc = await extractor.extract(filePath);
        return doc.getBody();
    } catch (error) {
        console.error(`Error extracting text from document: ${error}`);
        return '';
    }
}

/**
 * Read .pdf, .pptx, .xlsx files
 * @param {string} filePath
 * @returns {Promise<string>}
 */
export async function officeReader(filePath) {
    const extractor = getTextExtractor();
    return await extractor.extractText({ input: filePath, type: 'file' });
}

/**
 * @deprecated
 * Read pdf with pdf-parser
 * @param {string} filePath
 * @returns {Promise<string>}
 */
// export async function readPdf(filePath) {
//     const dataBuffer = fs.readFileSync(filePath);
//     const data = await pdf(dataBuffer);
//     return data.text;
// }
