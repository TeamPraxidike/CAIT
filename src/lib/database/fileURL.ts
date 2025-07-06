// import { Prisma } from '@prisma/client/extension';
import { Prisma } from '@prisma/client';
import { prisma } from '$lib/database/prisma';

export type FileURL = Prisma.FileURLGetPayload<true>;

export async function addFileURL(
	title: string,
	url: string,
	materialId: number,
	prismaContext: Prisma.TransactionClient = prisma,
): Promise<FileURL> {
	return prismaContext.fileURL.create({
		data: {
			name: title,
			url,
			materialId,
		},
	});
}