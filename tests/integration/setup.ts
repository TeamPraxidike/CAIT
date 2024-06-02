// import {beforeEach} from "vitest";
import { prisma } from '$lib/database';
import { vi } from 'vitest';
import * as authModule from '$lib/database/auth';

export const resetDb = async () => {
	// await prisma.$transaction([
	//     prisma.user.deleteMany(),
	//     prisma.publication.deleteMany(),
	//     prisma.material.deleteMany(),
	//     prisma.circuit.deleteMany(),
	//     prisma.node.deleteMany(),
	//     prisma.tag.deleteMany(),
	//     prisma.comment.deleteMany(),
	//     prisma.reply.deleteMany(),
	//     prisma.file.deleteMany(),
	//     prisma.publicationUsedInCourse.deleteMany()
	// ])

	const tablenames = await prisma.$queryRaw<
		Array<{ tablename: string }>
	>`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

	const tables = tablenames
		.map(({ tablename }) => tablename)
		.filter((name) => name !== '_prisma_migrations')
		.map((name) => `"public"."${name}"`)
		.join(', ');

	try {
		await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
	} catch (error) {
		console.error({ error });
	}
};

export async function resetMaterialTable() {
	try {
		await prisma.material.deleteMany({});
	} catch (error) {
		console.error('Failed to reset Material table:', error);
	}
}

export async function resetCircuitTable() {
	try {
		await prisma.circuit.deleteMany({});
	} catch (error) {
		console.error('Failed to reset Circuit table:', error);
	}
}

export async function resetUserTable() {
	try {
		await prisma.user.deleteMany({});
	} catch (error) {
		console.error('Failed to reset User table:', error);
	}
}

export async function resetTagsTable() {
	try {
		await prisma.tag.deleteMany({});
	} catch (error) {
		console.error('Failed to reset Tag table:', error);
	}
}

vi.mock('../src/auth', () => {
	return {
		...authModule,
		verifyAuth: vi.fn(),
		canEdit: vi.fn(),
		canRemove: vi.fn(),
	};
});

vi.mocked(authModule.verifyAuth).mockResolvedValue(null);
vi.mocked(authModule.canEdit).mockResolvedValue(true);
vi.mocked(authModule.canRemove).mockResolvedValue(true);

export const testingUrl = 'http://localhost:4173/api';
