import { describe, it, expect, vi } from 'vitest';

import {
	addTag,
	addTags,
	deleteTagByContent,
	getAllTags,
	getTagByContent,
	prisma,
} from '$lib/database';

describe('get specific material', () => {
	it('should return a material by publicationId', async () => {
		prisma.tag.findMany = vi
			.fn()
			.mockResolvedValue([
				{ content: 'new tag' },
				{ content: 'new tag' },
			]);

		const material = await getAllTags();
		expect(material).toMatchObject([
			{ content: 'new tag' },
			{ content: 'new tag' },
		]);
		expect(prisma.tag.findMany).toHaveBeenCalledWith({
			include: {
				publication: false,
			},
		});
	});
	it('should return a tag by content', async () => {
		prisma.tag.findUnique = vi
			.fn()
			.mockResolvedValue({ content: 'new tag' });

		const material = await getTagByContent('new tag');
		expect(material).toMatchObject({ content: 'new tag' });
	});
	it('should delete a tag by content', async () => {
		prisma.tag.delete = vi.fn().mockResolvedValue({ content: 'new tag' });

		const material = await deleteTagByContent('new tag');
		expect(material).toMatchObject({ count: 0 });
	});
});

describe('add tags', () => {
	it('should add one tag', async () => {
		prisma.tag.create = vi.fn().mockResolvedValue({ content: 'new tag' });

		const material = await addTag('new tag', prisma);
		expect(material).toMatchObject({ content: 'new tag' });
		prisma.tag.create = vi.fn().mockResolvedValue({ content: 'new upper' });

		const tag = await addTag('new Upper', prisma);
		expect(tag).toMatchObject({ content: 'new upper' });
		expect(prisma.tag.create).toHaveBeenCalledWith({
			data: { content: 'new upper' },
		});
	});
	it('should add tags', async () => {
		prisma.tag.createMany = vi
			.fn()
			.mockResolvedValue([{ content: 'Ivan' }]);

		prisma.tag.findMany = vi
			.fn()
			.mockResolvedValue([{ content: 'new tag' }, { content: 'tag' }]);

		const material = await addTags(['new tag'], prisma);
		expect(material.message).toEqual('All tags already exist');

		const tags = await addTags(['new tag', 'Ivan'], prisma);
		expect(tags.message).toEqual('Tags created successfully');

		const tags1 = await addTags(['Ivan', 'Ivan'], prisma);
		expect(tags1.message).toEqual('Tags created successfully');
	});
});
