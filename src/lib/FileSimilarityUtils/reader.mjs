import { getTextExtractor } from 'office-text-extractor';
import WordExtractor from 'word-extractor';
import removeMd from 'remove-markdown';
import { pythonKeywords } from './pythonKeywords.mjs';
import { fileSystem } from '../indexJS.mjs';
import { model } from '../similarityIndex.mjs';
import CustomRecursiveCharacterTextSplitter from '../DocumentSplitter/Splitter.mjs'
import { preprocessText } from './textProcessor.mjs';

export async function reader(filePath) {
    const extension = filePath.split('.').pop();

    // Map file extensions to corresponding reader functions
    const readers = {
        txt: txtReader,
        md: mdReader,
        ipynb: ipynbReader,
        py: pyReader,
        doc: wordReader,
        docx: wordReader,
        pdf: officeReader,
        pptx: officeReader,
        xlsx: officeReader,
    };

    const readFunction = readers[extension];

    if (!readFunction) {
        //return null; // Unsupported file type
        return { "text": null, "chunks": null }; // Unsupported file type
    }

    try {
        const text = await readFunction(filePath);

        // Create text splitter
        const splitter = new CustomRecursiveCharacterTextSplitter();
        const chunks = await splitter.splitText(text);

        const fileChunks = await Promise.all(
            chunks.map(async (content) => ({
                pageContent: content,
                embedding: await model.computeEmbeddingSingleText(preprocessText(content)),
                metadata: { extension: extension }
            }))
        );

        return { "text": text, "chunks": fileChunks };
    } catch (error) {
        console.error(`Error processing file: ${filePath}`, error);
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
        //return fs.readFileSync(filePath).toString('utf8');
        const buffer = await fileSystem.readFile(filePath);
        return buffer.toString('utf8');
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
        //const text = fs.readFileSync(filePath).toString('utf8');
        const buffer = await fileSystem.readFile(filePath);
        const text = buffer.toString('utf8');
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
        //const code = fs.readFileSync(filePath).toString('utf8');
        const buffer = await fileSystem.readFile(filePath);
        const code = buffer.toString('utf8');
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
        //const data = fs.readFileSync(filePath).toString('utf8');
        const buffer = await fileSystem.readFile(filePath);
        const data = buffer.toString('utf8');

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
        const data = await fileSystem.readFile(filePath);
        const doc = await extractor.extract(data);
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
    //return await extractor.extractText({ input: filePath, type: 'file' });
    const data = await fileSystem.readFile(filePath);
    return await extractor.extractText({ input: data, type: null });
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
