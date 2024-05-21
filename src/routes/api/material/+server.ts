import {
	getAllMaterials,
	createMaterialPublication,
	type FileDiffActions,
	handleConnections,
	addFile,
	type MaterialForm,
	prisma,
	basePath,
	type FetchedFileArray,
	fileSystem,
	addCover,
} from '$lib/database';
import type { RequestHandler } from '@sveltejs/kit';
import { Difficulty } from '@prisma/client';
import path from 'path';
import fs from 'fs';

/**
 * Convert a difficulty string to difficulty enum
 */
function mapToDifficulty(difficulty: string): Difficulty {
	switch (difficulty.toLowerCase()) {
		case 'easy':
			return Difficulty.easy;
		case 'medium':
			return Difficulty.medium;
		case 'hard':
			return Difficulty.hard;
		default:
			throw new Error(`Invalid difficulty: ${difficulty}`);
	}
}

/**
 * Get all materials
 */
export const GET: RequestHandler = async ({ url }) => {
	// Authentication step
	// return 401 if user not authenticated

	try {
		const t = url.searchParams.get('tags');
		const tags = t ? t.split(',') : [];

		const d = url.searchParams.get('difficulty');
		const diff = d ? d.split(',').map(mapToDifficulty) : [];

		const p = url.searchParams.get('publishers');
		const publishers = p ? p.split(',').map((x) => parseInt(x)) : [];

		const ty = url.searchParams.get('types');
		const type = ty ? ty.split(',') : [];

		const materials = await getAllMaterials(tags, publishers, diff, type);

		// coverPic return
		const fileData: FetchedFileArray = [];

		for (const material of materials) {
			let filePath;

			// coverPic
			if (!material.coverPic) {
				filePath = path.join(
					'static',
					'defaultCoverMaterial',
					material.encapsulatingType.toString() + '.jpg',
				);

				const currentFileData = fs.readFileSync(filePath);

				fileData.push({
					fileId: filePath,
					data: currentFileData.toString('base64'),
				});
			} else {
				filePath = material.coverPic.path;

				const currentFileData = fileSystem.readFile(filePath);
				fileData.push({
					fileId: filePath,
					data: currentFileData.toString('base64'),
				});
			}
		}

		return new Response(JSON.stringify({ materials, fileData }), {
			status: 200,
		});
	} catch (error) {
		console.log(error);
		return new Response(JSON.stringify({ error: 'Server Error' }), {
			status: 500,
		});
	}
};

/**
 * Create a publication of type material
 * @param request
 * @param params
 */
export async function POST({ request }) {
	// Authentication step
	// return 401 if user not authenticated

	const body: MaterialForm = await request.json();
	const tags = body.metaData.tags;
	const maintainers = body.metaData.maintainers;
	const metaData = body.metaData;
	const userId = body.userId;
	const fileInfo: FileDiffActions = body.fileDiff;
	const coverPic = body.coverPic;

	try {
		const createdMaterial = await prisma.$transaction(
			async (prismaTransaction) => {
				const material = await createMaterialPublication(
					userId,
					metaData,
					prismaTransaction,
				);

				if (!material) {
					return new Response(
						JSON.stringify({ error: 'Bad Request' }),
						{
							status: 400,
						},
					);
				}

				await handleConnections(
					tags,
					maintainers,
					material.publicationId,
					prismaTransaction,
				);

				if (coverPic) {
					const buffer: Buffer = Buffer.from(coverPic.info, 'base64');
					await addCover(
						'cover.jpg',
						coverPic.type,
						buffer,
						material.id,
						prismaTransaction,
					);
				} else {
					// const filePath = path.join(
					// 	'static',
					// 	'defaultCoverMaterial',
					// 	metaData.materialType.toString() + '.jpg',
					// );
					//
					// return prismaContext.file.create({
					// 	data: {
					// 		path: filePath,
					// 		title: 'cover.jpg',
					// 		type: coverPic.type,
					// 		materialCoverId: materialId, // Associate the cover with Material
					// 	},
					// });
				}

				// add files
				for (const file of fileInfo.add) {
					const buffer: Buffer = Buffer.from(file.info, 'base64');

					await addFile(
						file.title,
						file.type,
						buffer,
						material.id,
						prismaTransaction,
					);
				}

				return material;
			},
		);

		const id = createdMaterial.id;

		return new Response(JSON.stringify({ id }), { status: 200 });
	} catch (error) {
		console.log(error);
		return new Response(JSON.stringify({ error: 'Server Error' }), {
			status: 500,
		});
	}
}
