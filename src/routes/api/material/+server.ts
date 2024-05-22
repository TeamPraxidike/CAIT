import {
	addFile,
	createMaterialPublication,
	type FileDiffActions,
	getAllMaterials,
	handleConnections,
	type MaterialForm,
	prisma,
	type FetchedFileArray,
	updateCoverPic,
	updateFiles,
} from '$lib/database';
import type { RequestHandler } from '@sveltejs/kit';
import { Difficulty, MaterialType } from '@prisma/client';
import { coverPicFetcher } from '$lib/database/file';

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

function mapToType(mt: string): MaterialType {
	switch (mt.toLowerCase()) {
		case 'video':
			return MaterialType.video;
		case 'presentation':
			return MaterialType.presentation;
		case 'assignment':
			return MaterialType.assignment;
		case 'dataset':
			return MaterialType.dataset;
		case 'exam':
			return MaterialType.exam;
		case 'code':
			return MaterialType.code;
		default:
			throw new Error(`Invalid material type: ${mt}`);
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
		const type = ty ? ty.split(',').map(mapToType) : [];

		const sort = url.searchParams.get('sort') || 'Most Recent';
		const q: string = url.searchParams.get('q') || '';

		const materials = await getAllMaterials(
			tags,
			publishers,
			diff,
			type,
			sort,
			q,
		);

		const materials = await getAllMaterials(tags, publishers, diff, type);

		// coverPic return
		const fileData: FetchedFileArray = [];

		for (const material of materials) {
			fileData.push(
				coverPicFetcher(material.encapsulatingType, material.publication.coverPic),
			);
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

				await updateCoverPic(coverPic, material.publicationId, prismaTransaction);

				await updateFiles(fileInfo, material.id, prismaTransaction);

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
