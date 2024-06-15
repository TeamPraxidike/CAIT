import { type File as PrismaFile } from '@prisma/client';

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
 * Appends a file to a FormData object
 * @param formData FormData object
 * @param file File to append
 * @param key Key to use for the file
 */
export function appendFile(
	formData: FormData,
	file: File,
	key: string = 'file',
): void {
	if (file.size > 1024 * 1024 * 100) {
		alert('File size exceeds 100MB');
	} else {
		formData.append(key, file);
	}
}

/**
 * Saves a blob as a file
 * @param blob Blob to save
 * @param filename the name of the file to save
 */
export function saveFile(blob: Blob, filename: string): void {
	const url = URL.createObjectURL(blob);

	const a = document.createElement('a');
	a.href = url;
	a.download = filename;

	document.body.appendChild(a);
	a.click();

	// Remove the anchor from the body
	document.body.removeChild(a);
}

/**
 * Concatenates two FileList objects
 * @param fileList1 the first FileList object
 * @param fileList2 the second FileList object
 */
export function concatFileList(
	fileList1: FileList,
	fileList2: FileList,
): FileList {
	const arr1 = Array.from(fileList1);
	const arr2 = Array.from(fileList2).filter((file) => {
		return !arr1.some((f) => f.name === file.name);
	});

	return arr1.concat(arr2) as unknown as FileList;
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

export const IconMapExtension: Map<string, string> = new Map([
	['pdf', 'vscode-icons:file-type-pdf2'],
	['doc', 'vscode-icons:file-type-word'],
	['docx', 'vscode-icons:file-type-word'],
	['xls', 'vscode-icons:file-type-excel'],
	['xlsx', 'vscode-icons:file-type-excel'],
	['ppt', 'vscode-icons:file-type-powerpoint'],
	['pptx', 'vscode-icons:file-type-powerpoint'],
	['zip', 'vscode-icons:file-type-zip'],
	['rar', 'vscode-icons:file-type-zip'],
	['7z', 'vscode-icons:file-type-zip'],
	['tar', 'vscode-icons:file-type-zip'],
	['bz2', 'vscode-icons:file-type-zip'],
	['gz', 'vscode-icons:file-type-zip'],
	['jpeg', 'vscode-icons:file-type-image'],
	['jpg', 'vscode-icons:file-type-image'],
	['png', 'vscode-icons:file-type-image'],
	['gif', 'vscode-icons:file-type-image'],
	['svg', 'vscode-icons:file-type-image'],
	['bmp', 'vscode-icons:file-type-image'],
	['webp', 'vscode-icons:file-type-image'],
	['tiff', 'vscode-icons:file-type-image'],
	['ico', 'vscode-icons:file-type-image'],
	['mp4', 'vscode-icons:file-type-video'],
	['mov', 'vscode-icons:file-type-video'],
	['avi', 'vscode-icons:file-type-video'],
	['wmv', 'vscode-icons:file-type-video'],
	['flv', 'vscode-icons:file-type-video'],
	['webm', 'vscode-icons:file-type-video'],
	['3gp', 'vscode-icons:file-type-video'],
	['3g2', 'vscode-icons:file-type-video'],
	['ogg', 'vscode-icons:file-type-video'],
	['txt', 'vscode-icons:file-type-text'],
	['html', 'vscode-icons:file-type-html'],
	['css', 'vscode-icons:file-type-css'],
	['js', 'vscode-icons:file-type-js'],
	['ts', 'vscode-icons:file-type-typescript'],
	['md', 'vscode-icons:file-type-markdown'],
	['csv', 'vscode-icons:file-type-csv'],
	['ics', 'vscode-icons:file-type-calendar'],
	['vcf', 'vscode-icons:file-type-vcard'],
	['xml', 'vscode-icons:file-type-xml'],
	['yaml', 'vscode-icons:file-type-yaml'],
	['sql', 'vscode-icons:file-type-sql'],
	['java', 'vscode-icons:file-type-java'],
	['py', 'vscode-icons:file-type-python'],
	['scala', 'vscode-icons:file-type-scala'],
	['cs', 'vscode-icons:file-type-csharp'],
	['c', 'vscode-icons:file-type-c'],
	['cpp', 'vscode-icons:file-type-cpp'],
	['php', 'vscode-icons:file-type-php'],
	['json', 'vscode-icons:file-type-json'],
	['ts', 'vscode-icons:file-type-typescript'],
	['ipynb', 'vscode-icons:file-type-jupyter'],
]);

export const PublicationTypeIconMap: Map<string, string> = new Map([
	['video', 'akar-icons:video'],
	['lectureNotes', 'icon-park-solid:notes'],
	['assignment', 'material-symbols:assignment'],
	['other', 'mage:dots-horizontal-circle'],
	['slides', 'mdi:presentation'],
	['examQuestions', 'healthicons:i-exam-multiple-choice'],
]);
