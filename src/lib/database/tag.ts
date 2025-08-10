import { prisma } from '$lib/database';
import { Prisma } from '@prisma/client';
import type { Tag } from '@prisma/client';


export async function getAllTags(): Promise<Prisma.TagGetPayload<true>[]> {
	return prisma.tag.findMany({
		select: {
			content: true,
		},
	});
}

export async function addTag(
	content: string,
	prismaContext: Prisma.TransactionClient = prisma,
) {
	return prismaContext.tag.create({
		data: { content: content.toLowerCase() },
	});
}

export async function addTags(
	contents: string[],
	prismaContext: Prisma.TransactionClient = prisma,
) {
	// Convert all contents to lowercase
	const lowerCaseContents = contents.map((content) => content.toLowerCase());

	// Check for existing tags
	const existingTags: Tag[] = await prismaContext.tag.findMany({
		where: {
			content: {
				in: lowerCaseContents,
			},
		},
		select: {
			content: true,
		},
	});

	// Extract the existing tag contents
	const existingTagContents = existingTags.map((tag) => tag.content);

	// Filter out the tags that already exist
	const newTagsData = lowerCaseContents
		.filter((content) => !existingTagContents.includes(content))
		.map((content) => ({ content }));

	// If there are no new tags to add, return an appropriate response
	if (newTagsData.length === 0) {
		return { message: 'All tags already exist', createdCount: 0 };
	}

	// Use createMany to insert multiple records at once
	const createResult = await prismaContext.tag.createMany({
		data: newTagsData,
		skipDuplicates: true,
	});

	return {
		message: 'Tags created successfully',
		createdCount: createResult.count,
	};
}

export async function getTagByContent(content: string): Promise<Prisma.TagGetPayload<true>> {
	return prisma.tag.findUnique({
		where: { content: content.toLowerCase() },
	});
}

export async function deleteTagByContent(content: string): Promise<Prisma.TagGetPayload<true>> {
	return prisma.tag.deleteMany({
		where: { content: content.toLowerCase() },
	});
}
