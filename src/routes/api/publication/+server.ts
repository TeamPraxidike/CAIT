import type { RequestHandler } from '@sveltejs/kit';
import { coverPicFetcher, fileSystem } from '$lib/database';
import { getAllPublications } from '$lib/database/db';
import { type Publication, PublicationType } from '@prisma/client';
import { profilePicFetcher } from '$lib/database/file';

export const GET: RequestHandler = async ({ url }) => {
	try {
		const p = url.searchParams.get('publishers');
		const includeDraft = url.searchParams.get('includeDraft') === 'true' || false;
		const publishers = p ? p.split(',') : [];
		const query: string = url.searchParams.get('q') || '';
		const amount: number = Number(url.searchParams.get('amount')) || 8;

		let publications = await getAllPublications(publishers, query, includeDraft);

		publications = await Promise.all(publications.map(async (publication: any) => {
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
				const currentFileData = await fileSystem.readFile(filePath);
				coverPicData = currentFileData.toString('base64');
			}
			return {
				...publication,
				coverPicData: coverPicData,
			};
		}));
		publications = await Promise.all(publications.map(async (publication: any) => {
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
		return new Response(
			JSON.stringify({
				publications: publications.slice(0, amount),
				ids: publications.map((x: { id: any; }) => x.id),
			}),
			{
				status: 200,
			},
		);
	} catch (error) {
		console.log(error);
		return new Response(JSON.stringify({ error: 'Server Error' }), {
			status: 500,
		});
	}
};
