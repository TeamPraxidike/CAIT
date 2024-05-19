import { type File as PrismaFile } from '@prisma/client';
import { Buffer } from 'buffer';

/**
 * A FileList object that is created from a list of fetched files and a list of prisma files
 * @param fetchedFiles the list of fetched files
 * @param prismaFiles the list of prisma files
 * @returns a FileList object that can be easily displayed in the FileTable component
 * @see fetchedArrayToFileArray
 */
export function createFileList(
	fetchedFiles: {
		fileId: string;
		data: string;
	}[],
	prismaFiles: PrismaFile[],
): FileList {
	const files = fetchedArrayToFileArray(fetchedFiles, prismaFiles);

	const fileProperties = files.reduce(
		(acc, _, index) => {
			acc[index] = {
				get() {
					return files[index] || null;
				},
			};
			return acc;
		},
		{} as { [key: number]: { get: () => File | null } },
	);

	return Object.create(
		{
			length: files.length,
		},
		fileProperties,
	);
}

/**
 * Converts a list of fetched files and a list of prisma files to a list of File objects
 *
 * @param fetchedFiles the fetched files to convert. They contain the file id and the base64 data
 * @param prismaFiles the prisma files to convert. They contain the file path, title, and type
 * @return a list of File objects
 *
 * @see base64ToFile
 */
export function fetchedArrayToFileArray(
	fetchedFiles: { fileId: string; data: string }[],
	prismaFiles: PrismaFile[],
): File[] {
	return fetchedFiles.map((fetchedFile) => {
		const name =
			prismaFiles.find((file) => {
				return file.path === fetchedFile.fileId; // Add return statement here
			})?.title || 'Untitled';
		const type =
			prismaFiles.find((file) => {
				return file.path === fetchedFile.fileId; // Add return statement here
			})?.type || 'Untitled';

		return base64ToFile(fetchedFile.data, name, type);
	});
}

/**
 * Converts a base64 string to a File object with the given filename and type
 *
 * @param base64String the base64 string to convert.
 * @param filename the filename to be used after conversion
 * @param type the type of the file
 * @returns a File object with the given filename and type and the data parsed as a blob
 */
export function base64ToFile(
	base64String: string,
	filename: string,
	type: string,
): File {
	const bstr = atob(base64String);
	let n = bstr.length;
	const u8arr = new Uint8Array(n);

	while (n--) {
		u8arr[n] = bstr.charCodeAt(n);
	}

	return new File([u8arr], filename, { type });
}

/**
 * A map of file types to their respective icons.
 * @note the code below is bloated, but it is necessary to maintain the map.
 */
export const IconMap: Map<string, string> = new Map([
	['application/pdf', 'vscode-icons:file-type-pdf2'],
	['application/msword', 'vscode-icons:file-type-word'],
	[
		'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
		'vscode-icons:file-type-word',
	],
	['application/vnd.ms-excel', 'vscode-icons:file-type-excel'],
	[
		'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
		'vscode-icons:file-type-excel',
	],
	['application/vnd.ms-powerpoint', 'vscode-icons:file-type-powerpoint'],
	[
		'application/vnd.openxmlformats-officedocument.presentationml.presentation',
		'vscode-icons:file-type-powerpoint',
	],
	['application/zip', 'vscode-icons:file-type-zip'],
	['application/x-rar-compressed', 'vscode-icons:file-type-zip'],
	['application/x-7z-compressed', 'vscode-icons:file-type-zip'],
	['application/x-tar', 'vscode-icons:file-type-zip'],
	['application/x-bzip2', 'vscode-icons:file-type-zip'],
	['application/x-gzip', 'vscode-icons:file-type-zip'],
	['application/x-7z-compressed', 'vscode-icons:file-type-zip'],
	['application/x-zip-compressed', 'vscode-icons:file-type-zip'],
	['image/jpeg', 'vscode-icons:file-type-image'],
	['image/png', 'vscode-icons:file-type-image'],
	['image/gif', 'vscode-icons:file-type-image'],
	['image/svg+xml', 'vscode-icons:file-type-image'],
	['image/bmp', 'vscode-icons:file-type-image'],
	['image/webp', 'vscode-icons:file-type-image'],
	['image/tiff', 'vscode-icons:file-type-image'],
	['image/x-icon', 'vscode-icons:file-type-image'],
	['video/mp4', 'vscode-icons:file-type-video'],
	['video/quicktime', 'vscode-icons:file-type-video'],
	['video/x-msvideo', 'vscode-icons:file-type-video'],
	['video/x-ms-wmv', 'vscode-icons:file-type-video'],
	['video/x-flv', 'vscode-icons:file-type-video'],
	['video/webm', 'vscode-icons:file-type-video'],
	['video/3gpp', 'vscode-icons:file-type-video'],
	['video/3gpp2', 'vscode-icons:file-type-video'],
	['video/ogg', 'vscode-icons:file-type-video'],
	['text/plain', 'vscode-icons:file-type-text'],
	['text/html', 'vscode-icons:file-type-html'],
	['text/css', 'vscode-icons:file-type-css'],
	['text/javascript', 'vscode-icons:file-type-js'],
	['text/typescript', 'vscode-icons:file-type-typescript'],
	['text/markdown', 'vscode-icons:file-type-markdown'],
	['text/csv', 'vscode-icons:file-type-csv'],
	['text/calendar', 'vscode-icons:file-type-calendar'],
	['text/vcard', 'vscode-icons:file-type-vcard'],
	['text/xml', 'vscode-icons:file-type-xml'],
	['text/yaml', 'vscode-icons:file-type-yaml'],
	['text/x-sql', 'vscode-icons:file-type-sql'],
	['text/x-java', 'vscode-icons:file-type-java'],
	['text/x-python', 'vscode-icons:file-type-python'],
	['text/x-scala', 'vscode-icons:file-type-scala'],
	['text/x-csharp', 'vscode-icons:file-type-csharp'],
	['text/x-c', 'vscode-icons:file-type-c'],
	['text/x-c++', 'vscode-icons:file-type-cpp'],
	['text/x-php', 'vscode-icons:file-type-php'],
	['application/json', 'vscode-icons:file-type-json'],
	['application/vnd.trolltech.linguist', 'vscode-icons:file-type-typescript'],
]);
