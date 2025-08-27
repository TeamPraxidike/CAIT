import type { FileDiffActions } from '$lib/database';

export const PUBLICATION_PARAMETERS = {
	titleLength: 1,
	descriptionLength: 1,
	learningObjectivesMin: 1,
	filesMin: 1,
	tagsMin: 1,
	materialTypeRequired: true
}

export type Metadata = {
	title: string;
	description: string;
	learningObjectives: string[];
	tags: string[];
	materialType: string[];
	isDraft: boolean;
};

export type MetadataWithURLs = Metadata & {
	fileURLs: string[];
}

export function validateMetadata(metadata: Omit<Metadata, "materialType">) {
	return metadata.title.length >= PUBLICATION_PARAMETERS.titleLength &&
		metadata.description.length >= PUBLICATION_PARAMETERS.descriptionLength &&
		metadata.learningObjectives.length >= PUBLICATION_PARAMETERS.learningObjectivesMin &&
		metadata.tags.length >= PUBLICATION_PARAMETERS.tagsMin
}

export function isMaterialValid(metadata: MetadataWithURLs, fileInfo: FileDiffActions) {
	if(metadata.isDraft) return true;
	if (PUBLICATION_PARAMETERS.materialTypeRequired && !metadata.materialType) return false;
	return validateMetadata(metadata) &&
		(fileInfo.add.length - fileInfo.delete.length) + metadata.fileURLs.length >= PUBLICATION_PARAMETERS.filesMin;
}

export function isMaterialDraft(metadata: Metadata, numFiles: number) {
	if (PUBLICATION_PARAMETERS.materialTypeRequired && !metadata.materialType) return true;
	return !validateMetadata(metadata) ||
		numFiles < PUBLICATION_PARAMETERS.filesMin;
}