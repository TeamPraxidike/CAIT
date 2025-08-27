import type { RequestHandler } from '@sveltejs/kit';
import { getAllPublications, getAllPublicationsByIds } from '$lib/database/db';
import { PublicationType } from '@prisma/client';
import { coverPicFetcher, fileSystem } from '$lib/database';
import { profilePicFetcher } from '$lib/database/file';

export const GET: RequestHandler = async ({ url }) => {
	try {
		const p = url.searchParams.get('ids');
		const sort = url.searchParams.get('sort') || 'Most Recent';
		const ids = (p ? p.split(',') : []).map((n) => Number(n));
		let publications = await getAllPublicationsByIds(ids, sort);

		publications = await Promise.all(publications.map(async (publication) => {
			let coverPicData: string | null;
			if (
				publication.type === PublicationType.Material &&
				publication.materials
			) {
				coverPicData = (await coverPicFetcher(
					publication.materials.encapsulatingType,
					publication.coverPic,
				)).data;
			} else {
				const filePath = publication.coverPic!.path;
				coverPicData = (await coverPicFetcher(
					null,
					publication.coverPic,
				)).data;
				// const currentFileData = await fileSystem.readFile(filePath);
				// coverPicData = currentFileData.toString('base64');
			}
			return {
				...publication,
				coverPicData: coverPicData,
			};
		}));
		publications = await Promise.all(publications.map(async (publication) => {
			return {
				...publication,
				publisher: {
					...publication.publisher,
					profilePicData: (await profilePicFetcher(
						publication.publisher.profilePic,
					)).data,
				},
			};
		}));
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
