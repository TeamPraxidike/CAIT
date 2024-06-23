import type { RequestHandler } from '@sveltejs/kit';
import { getAllPublications, getAllPublicationsByIds } from '$lib/database/db';
import { PublicationType } from '@prisma/client';
import { coverPicFetcher, fileSystem } from '$lib/database';
import { profilePicFetcher } from '$lib/database/file';

export const GET: RequestHandler = async ({ url }) => {
	try {
		console.log('Here');
		const p = url.searchParams.get('ids');
		const ids = (p ? p.split(',') : []).map((n) => Number(n));
		console.log(ids);
		let publications = await getAllPublicationsByIds(ids);

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
		publications = publications.map((publication) => {
			return {
				...publication,
				publisher: {
					...publication.publisher,
					profilePicData: profilePicFetcher(
						publication.publisher.profilePic,
					).data,
				},
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
