

export const getFileExtension = (filePath: string): string =>  {
	const index = filePath.lastIndexOf('.');
	return index !== -1 ? filePath.substring(index + 1) : '';
}