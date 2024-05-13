export default interface FileSystem {
	saveFile(file: Blob, name: string): Promise<string>;
	deleteFile(path: string): void;
	readFile(path: string): Buffer;
	editFile(path: string, file: Blob): Promise<string>;
}
