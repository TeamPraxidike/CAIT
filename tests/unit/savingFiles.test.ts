import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LocalFileSystem } from '$lib/FileSystemPort/LocalFileSystem';
import fs from 'fs';
import path from 'path';

const basePath = path.join('static', 'uploadedFiles');

describe('Local File Handling', () => {
	let fileSystem: LocalFileSystem;
	const createdFiles: string[] = [];

	beforeEach(() => {
		if (!fs.existsSync(basePath)) {
			fs.mkdirSync(basePath);
		}
		fileSystem = new LocalFileSystem();
	});

	afterEach(() => {
		createdFiles.forEach((file) => {
			if (fs.existsSync(path.join(basePath, file))) {
				fs.unlinkSync(path.join(basePath, file));
			}
		});
	});

	// TODO: FLAKY TEST
	// it('should be possible save the file on the server and access it later', async () => {
	// 	const binaryData = new Blob(['Hello I am a blob, my name is blob']);
	// 	const pathSaved = await fileSystem.saveFile(binaryData, 'blob.txt');
	// 	createdFiles.push(pathSaved);
	//
	// 	const data = fileSystem.readFile(pathSaved);
	// 	expect(data.toString()).toEqual('Hello I am a blob, my name is blob');
	//
	// 	const data2 = fs.readFileSync(path.join(basePath, pathSaved)).toString();
	// 	expect(data2).toEqual('Hello I am a blob, my name is blob');
	//
	// 	fileSystem.deleteFile(pathSaved);
	// 	expect(() => fileSystem.readFile(pathSaved)).toThrowError();
	// 	expect(() =>
	// 		fs.readFileSync(path.join(basePath, pathSaved)),
	// 	).toThrowError();
	// });

	it('should be possible edit an existing file', async () => {
		const binaryData = Buffer.from('Hello I am a blob, my name is blob');
		const pathSaved = await fileSystem.saveFile(binaryData, 'blob2.txt');
		createdFiles.push(pathSaved);

		const data = fileSystem.readFile(pathSaved);
		console.log('Data is: ' + data);
		expect(data.toString()).toEqual('Hello I am a blob, my name is blob');

		await fileSystem.editFile(pathSaved, Buffer.from('I am a new blob'));

		const data2 = fileSystem.readFile(pathSaved);
		expect(data2.toString()).toEqual('I am a new blob');
		console.log('Data is: ' + data2);

		fileSystem.deleteFile(pathSaved);
		expect(() => fileSystem.readFile(pathSaved)).toThrowError();
	});
});
