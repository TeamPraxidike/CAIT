import {
	createMaterialPublication,
	type FetchedFileArray,
	type FileDiffActions,
	getAllMaterials,
	handleConnections,
	type MaterialForm,
	prisma,
	updateCoverPic,
	updateFiles,
} from '$lib/database';
import type { RequestHandler } from '@sveltejs/kit';
import { coverPicFetcher } from '$lib/database/file';
import { mapToDifficulty, mapToType } from '$lib';
/**
 * Convert a difficulty string to difficulty enum
 */

/**
 * Get all materials
 */
export const GET: RequestHandler = async ({ url }) => {
	try {
		const t = url.searchParams.get('tags');
		const tags = t ? t.split(',') : [];

		const d = url.searchParams.get('difficulty');
		const diff = d ? d.split(',').map(mapToDifficulty) : [];

		const p = url.searchParams.get('publishers');
		const publishers = p ? p.split(',') : [];
		// const publishers = p ? p.split(',').map((x) => parseInt(x)) : [];

		const ty = url.searchParams.get('types');
		const type = ty ? ty.split(',').map(mapToType) : [];

		const sort = url.searchParams.get('sort') || 'Most Recent';
		const query: string = url.searchParams.get('q') || '';

		let materials = await getAllMaterials(
			tags,
			publishers,
			diff,
			type,
			sort,
			query,
		);

		// coverPic return

		materials = materials.map((material) => {
			return {
				...material,
				coverPicData: coverPicFetcher(
					material.encapsulatingType,
					material.publication.coverPic,
				).data,
			};
		});

		return new Response(JSON.stringify({ materials }), {
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
	// Add 400 Bad Request check

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

				await handleConnections(
					tags,
					maintainers,
					material.publicationId,
					prismaTransaction,
				);

				await updateCoverPic(
					coverPic,
					material.publicationId,
					prismaTransaction,
				);

				await updateFiles(fileInfo, material.id, prismaTransaction);

				return material;
			},
		);

		const id = createdMaterial.publicationId;

		return new Response(JSON.stringify({ id }), { status: 200 });
	} catch (error) {
		console.log(error);
		return new Response(JSON.stringify({ error: 'Server Error' }), {
			status: 500,
		});
	}
}
