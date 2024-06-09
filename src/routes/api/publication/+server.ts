import type { RequestHandler } from '@sveltejs/kit';
import { mapToDifficulty, mapToType } from '$lib';
import { coverPicFetcher, fileSystem, getAllMaterials } from '$lib/database';
import { getAllPublications } from '$lib/database/db';
import { PublicationType } from '@prisma/client';

export const GET: RequestHandler = async ({ url }) => {
	try {
		console.log('HERE');
		const p = url.searchParams.get('publishers');
		const publishers = p ? p.split(',') : [];
		const query: string = url.searchParams.get('q') || '';

		let publications = await getAllPublications(publishers, query);
		console.log(publications);

		publications = publications.map((publication) => {
			let coverPicData = '';
			if (
				publication.type === PublicationType.Material &&
				publication.materials
			) {
				coverPicData = coverPicFetcher(
					publication.materials.encapsulatingType,
					publication.coverPic,
				).data;
			} else {
				const filePath = publication.coverPic!.path;
				const currentFileData = fileSystem.readFile(filePath);
				coverPicData = currentFileData.toString('base64');
			}
			return {
				...publication,
				coverPicData: coverPicData,
			};
		});
		return new Response(JSON.stringify({ publications }), {
			status: 200,
		});
	} catch (error) {
		console.log(error);
		return new Response(JSON.stringify({ error: 'Server Error' }), {
			status: 500,
		});
	}
};
