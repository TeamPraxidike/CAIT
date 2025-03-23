/**
 * Port Interface for file system operations.
 * This is used to abstract the file system operations from the rest of the application.
 *
 * @see LocalFileSystem
 */
class FileSystem {
	/**
	 * Saves a file.
	 * @param {Buffer} file - The file buffer to save.
	 * @param {string} name - The name of the file.
	 * @returns {Promise<string>}
	 */
	saveFile(file, name) {
		throw new Error('Method "saveFile" must be implemented.');
	}

	/**
	 * Deletes a file.
	 * @param {string} path
	 */
	deleteFile(path) {
		throw new Error('Method "deleteFile" must be implemented.');
	}

	/**
	 * Reads a file.
	 * @param {string} path
	 * @returns {Promise<Buffer>}
	 */
	readFile(path) {
		throw new Error('Method "readFile" must be implemented.');
	}

	/**
	 * Edits a file.
	 * @param {string} path
	 * @param {Buffer} file
	 * @returns {Promise<string>}
	 */
	editFile(path, file) {
		throw new Error('Method "editFile" must be implemented.');
	}
}

export default FileSystem;