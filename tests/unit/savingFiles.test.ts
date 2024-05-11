import {describe, it, expect, beforeEach, afterEach} from 'vitest';
import {LocalFileSystem} from "$lib/fileSystem/localFileSystem";
import fs from "fs";



describe('Local File Handling', () => {
    let fileSystem: LocalFileSystem;
    const createdFiles: string[] = [];

    beforeEach(() => {
        if (!fs.existsSync('static\\uploadedFiles')) {
            fs.mkdirSync('static\\uploadedFiles');
        }
        fileSystem = new LocalFileSystem();
    });

    afterEach(() => {
       createdFiles.forEach(file => {
           if(fs.existsSync('static\\uploadedFiles\\' + file)) {
               fs.unlinkSync('static\\uploadedFiles\\' + file);
           }
       });
    });

    it('should be possible save the file on the server and access it later', async () => {
        const binaryData = new Blob(['Hello I am a blob, my name is blob']);
        const path = await fileSystem.saveFile(binaryData, 'blob.txt');
        createdFiles.push(path);

        const data = fileSystem.readFile(path);
        expect(data.toString()).toEqual('Hello I am a blob, my name is blob');

        const data2 = fs.readFileSync('static\\uploadedFiles\\' + path).toString();
        expect(data2).toEqual('Hello I am a blob, my name is blob');

        fileSystem.deleteFile(path);
        expect(() => fileSystem.readFile(path)).toThrowError();
        expect(() => fs.readFileSync('static\\uploadedFiles\\' + path)).toThrowError();
    });

    it('should be possible edit an existing file', async () => {
        const binaryData = new Blob(['Hello I am a blob, my name is blob']);
        const path = await fileSystem.saveFile(binaryData, 'blob2.txt');
        createdFiles.push(path);

        const data = fileSystem.readFile(path);
        console.log("Data is: " + data);
        expect(data.toString()).toEqual('Hello I am a blob, my name is blob');

        await fileSystem.editFile(path, new Blob(['I am a new blob']));

        const data2 = fileSystem.readFile(path);
        expect(data2.toString()).toEqual('I am a new blob');
        console.log("Data is: " + data2);

        fileSystem.deleteFile(path);
        expect(() => fileSystem.readFile(path)).toThrowError();
    });
});

