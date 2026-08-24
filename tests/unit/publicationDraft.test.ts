import { describe, expect, it } from 'vitest';
import {
	getValidationFileCount,
	isPublicationDraft,
	type Metadata,
} from '$lib/util/validatePublication';

const validMaterial: Metadata = {
	isCircuit: false,
	title: 'Title',
	description: '',
	learningObjectives: ['Objective'],
	tags: ['tag'],
	materialType: ['other'],
	isDraft: false,
};

describe('publication edit draft validation', () => {
	it('grandfathers only an existing publication that started without files', () => {
		expect(getValidationFileCount(0, 0, true)).toBe(1);
		expect(isPublicationDraft(validMaterial, getValidationFileCount(0, 0, true))).toBe(false);
	});

	it('marks an edit as draft when its last existing file is removed', () => {
		expect(getValidationFileCount(0, 1, true)).toBe(0);
		expect(isPublicationDraft(validMaterial, getValidationFileCount(0, 1, true))).toBe(true);
	});

	it('allows a completed draft to become publishable', () => {
		expect(isPublicationDraft(validMaterial, 1)).toBe(false);
	});

	it('validates required circuit metadata during edits', () => {
		expect(isPublicationDraft({ ...validMaterial, isCircuit: true, tags: [] }, 0)).toBe(true);
		expect(isPublicationDraft({ ...validMaterial, isCircuit: true }, 0)).toBe(false);
	});
});
