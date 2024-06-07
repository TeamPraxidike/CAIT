import fs from 'fs';
import {getTextExtractor} from 'office-text-extractor'
import WordExtractor from 'word-extractor'
import removeMd from 'remove-markdown'
import {pythonKeywords} from "./pythonKeywords.js";


export async function reader(filePath: string): Promise<string> {
    switch(filePath.split('.')[1]) {
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
            return officeReader(filePath)

        default:
            throw new Error("File extension not supported")
    }
}

/**
 * Read .txt file
 * @param filePath
 */
export async function txtReader(filePath: string): Promise<string> {
    try {
        return fs.readFileSync(filePath).toString('utf8');
    } catch (err) {
        console.error('Error reading the file:', err);
        return "";
    }
}

/**
 * Read .md file
 * @param filePath
 */
export async function mdReader(filePath: string): Promise<string> {
    try {
        const text = fs.readFileSync(filePath).toString('utf8');
        return removeMd(text);
    } catch (err) {
        console.error('Error reading the file:', err);
        return "";
    }
}

/**
 * Helper method which extracts text from code
 * @param source
 */
export function pythonCodeParser(source: string): string {
    let textContent = ''

    const filteredSource = source
        .replace(/[^A-Za-z ]+/g, ' ')
        .trim()
        .split(/\s+/);

    for (const str of filteredSource) {
        // filter out keywords
        if (!pythonKeywords.has(str)) {
            textContent += " " + removeMd(str);
        }
    }

    return textContent
}

/**
 * Read .py file
 * @param filePath
 */
export async function pyReader(filePath: string): Promise<string> {
    try {
        const code =  fs.readFileSync(filePath).toString('utf8');
        return pythonCodeParser(code);
    } catch (err) {
        console.error('Error reading the file:', err);
        return "";
    }
}

/**
 * Read .ipynb file
 * @param filePath
 */
export async function ipynbReader(filePath: string) {
    try {
        const data = fs.readFileSync(filePath).toString('utf8');

        const notebook = JSON.parse(data);
        let textContent = '';

        notebook.cells.forEach((cell: { cell_type: string; "metadata" : any, source: string | string[] }) => {
            if (typeof cell.source === 'string') {
                if (cell.cell_type === 'markdown') {
                    textContent += "\n" + removeMd(cell.source);
                }
                else if (cell.cell_type === 'code') {
                    const content = pythonCodeParser(cell.source)
                    textContent += "\n" + content
                }
            }
            else {
                if (cell.cell_type === 'markdown') {
                    for (const str of cell.source) {
                        textContent += "\n" + removeMd(str);
                    }
                }
                else if (cell.cell_type === 'code') {
                    const content = pythonCodeParser(cell.source.join("\n"))
                    textContent += "\n" + content
                }
            }
        });

        return textContent;
    } catch (err) {
        console.error('Error reading the file:', err);
        return "";
    }
}


/**
 * Read .doc and .docx files
 * @param filePath
 */
export async function wordReader(filePath: string): Promise<string> {
    const extractor = new WordExtractor();
    try {
        const doc = await extractor.extract(filePath);
        return doc.getBody();
    } catch (error) {
        console.error(`Error extracting text from document: ${error}`);
        return "";
    }
}

/**
 * Read .pdf, .pptx, .xlsx files
 * @param filePath
 */
export async function officeReader(filePath: string): Promise<string> {
    const extractor = getTextExtractor()
    return await extractor.extractText({input: filePath, type: 'file'});
}

/**
 * @deprecated
 * Read pdf with pdf-parser
 * @param filePath
 */
// export async function readPdf(filePath: string): Promise<string> {
//     const dataBuffer = fs.readFileSync(filePath);
//     const data = await pdf(dataBuffer);
//     return data.text;
// }
