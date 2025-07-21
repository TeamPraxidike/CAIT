import {
	createMaterialPublication,
	type FileDiffActions,
	getAllMaterials,
	handleConnections,
	type MaterialForm,
	prisma,
	updateCoverPic,
	updateFiles,
	updateReputation,
} from '$lib/database';
import type { RequestHandler } from '@sveltejs/kit';
import { enqueueMaterialComparison } from '$lib/PiscinaUtils/runner';

import { coverPicFetcher, profilePicFetcher } from '$lib/database/file';
import { mapToDifficulty, mapToType } from '$lib';

import type { PrismaClient, Tag} from '@prisma/client';
import { verifyAuth } from '$lib/database/auth';
import type { MaterialWithPublication, MaterialWithPublicationNoFiles } from '$lib/database/material';
import { isMaterialValid } from '$lib/util/validatePublication';
import { linkCourseToPublication } from '$lib/database/courses';

const reorderTags = (tags: Tag[], search: string[]): Tag[] => {
	const tagsC = tags.map((x) => x.content);
	const targetTags: Tag[] = [];
	const nonTargetTags: Tag[] = [];
	for (const t of tagsC) {
		if (search.includes(t)) {
			targetTags.push({ content: t });
		} else {
			nonTargetTags.push({ content: t });
		}
	}
	return targetTags.concat(nonTargetTags);
};

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
		const amount: number = Number(url.searchParams.get('amount')) || 8;

		let materials = await getAllMaterials(
			tags,
			publishers,
			diff,
			type,
			sort,
			query,
		);

		materials = materials.filter((m: MaterialWithPublication) => !m.publication.isDraft);
		for (const material of materials) {
			material.publication.tags = reorderTags(
				material.publication.tags,
				tags,
			);
		}

		materials = await Promise.all(materials.map(async (material) => {
			return {
				...material,
				publisher: {
					...material.publication.publisher,
					profilePicData: (await profilePicFetcher(
						material.publication.publisher.profilePic,
					)).data,
				},
				coverPicData: (await coverPicFetcher(
					material.encapsulatingType,
					material.publication.coverPic,
				)).data,
			};
		}));

		return new Response(
			JSON.stringify({
				materials: materials.slice(0, amount),
				idsMat: materials.map((m) => m.publicationId),
			}),
			{
				status: 200,
			},
		);
	} catch (error) {
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
export async function POST({ request , locals}) {
	// Authentication step
	// return 401 if user not authenticated
	// Add 400 Bad Request check
	const body: MaterialForm = await request.json();

	const authError = await verifyAuth(locals, body.userId);
	if (authError) return authError;

	if ((await locals.safeGetSession()).user!.id !== body.userId) {
		return new Response(
			JSON.stringify({
				error: 'Bad Request - User IDs not matching',
			}),
			{ status: 401 },
		);
	}

	const tags = body.metaData.tags;
	const maintainers = body.metaData.maintainers;
	const metaData = body.metaData;
	const userId = body.userId;
	const fileInfo: FileDiffActions = body.fileDiff;
	const coverPic = body.coverPic;

	if(!isMaterialValid(metaData, fileInfo)) {
		metaData.isDraft = true;
	}

	try {
		const createdMaterial: MaterialWithPublicationNoFiles = await prisma.$transaction(
			async (prismaTransaction: PrismaClient) => {
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
					userId,
					prismaTransaction,
				);

				await updateFiles(fileInfo, material.id, userId, prismaTransaction);
				console.log(material);
				if (body.metaData.course) {
					await linkCourseToPublication(material.publication.id, body.metaData.course, prismaTransaction);
				}
				return material;
			},
		);

		await updateReputation(userId, 30);

		const publicationId = createdMaterial.publicationId;
		const materialId = createdMaterial.id;

		enqueueMaterialComparison(publicationId, materialId).catch((error) =>
			console.error(error),
		);

		return new Response(JSON.stringify({ id: publicationId }), {
			status: 200,
		});
	} catch (error) {
		console.error(error);
		return new Response(JSON.stringify({ error: 'Server Error' }), {
			status: 500,
		});
	}
}

