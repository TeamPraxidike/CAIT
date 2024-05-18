import { prisma } from '$lib/database';
import { Prisma } from '@prisma/client/extension';

export async function getAllTags() {
	return prisma.tag.findMany({
		include: {
			publication: false,
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

export async function getTagByContent(content: string) {
	return prisma.tag.findMany({
		where: { content: content.toLowerCase() },
	});
}

export async function deleteTagByContent(content: string) {
	return prisma.tag.deleteMany({
		where: { content: content.toLowerCase() },
	});
}
