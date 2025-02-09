/**
 * Port Interface for file system operations^
 * This is used to abstract the file system operations from the rest of the application.
 *
 * @see LocalFileSystem
 */
export default interface FileSystem {
	saveFile(file: Buffer, name: string, ownerId: string): Promise<string>;
	deleteFile(path: string): void;
	readFile(path: string): Promise<Buffer>;
	editFile(path: string, file: Buffer): Promise<string>;
}
