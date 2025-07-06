import { describe, it, expect } from 'vitest';
import {
	addTag,
	addTags,
	deleteTagByContent,
	getAllTags,
	getTagByContent,
} from '$lib/database';
import { resetTagsTable } from '../setup';
import { generateRandomString } from '../../utility/publicationsUtility';

await resetTagsTable();

describe('tagService', () => {
	it('should add a tag to a publication', async () => {
		const tagName = generateRandomString();
		await addTag(tagName);
		const tags = await getAllTags();
		expect(tags).toContainEqual({ content: tagName.toLowerCase() });
		expect(await getTagByContent(tagName)).toEqual({
			content: tagName.toLowerCase(),
		});
	});

	it('should add multiple tags to a publication at once, but ignore repeating ones', async () => {
		const tagArr = [generateRandomString(), generateRandomString(), generateRandomString(), generateRandomString()];
		await addTags(tagArr);
		const tags = await getAllTags();
		expect(tags).toContainEqual({ content: tagArr[0].toLowerCase() });
		expect(tags).toContainEqual({ content: tagArr[1].toLowerCase() });
		expect(tags).toContainEqual({ content: tagArr[2].toLowerCase() });
		expect(tags).toContainEqual({ content: tagArr[3].toLowerCase() });
	});

	it('should multiple tags to a publication', async () => {
		const tagArr = [generateRandomString(), generateRandomString(), generateRandomString()];
		await addTag(tagArr[0]);
		await addTag(tagArr[1]);
		await addTag(tagArr[2]);
		const tags = await getAllTags();
		expect(tags).toContainEqual({ content: tagArr[0].toLowerCase() });
		expect(tags).toContainEqual({ content: tagArr[1].toLowerCase() });
		expect(tags).toContainEqual({ content: tagArr[2].toLowerCase() });
	});

	it('should delete tags', async () => {
		const tagArr = [generateRandomString(), generateRandomString(), generateRandomString()];
		await addTag(tagArr[0]);
		await addTag(tagArr[1]);
		await addTag(tagArr[2]);

		await deleteTagByContent(tagArr[0].toLowerCase());

		const tags = await getAllTags();
		expect(tags).not.toContainEqual({ content: tagArr[0].toLowerCase() });
		expect(tags).toContainEqual({ content: tagArr[1].toLowerCase() });
		expect(tags).toContainEqual({ content: tagArr[2].toLowerCase() });
	});
});
