import {
	coverPicFetcher,
	type FetchedFileArray,
	fileSystem,
	getLikedPublications,
	getUserById,
} from '$lib/database';
import { verifyAuth } from '$lib/database/auth';
import { profilePicFetcher } from '$lib/database/file';
import Fuse from 'fuse.js';
import type { Publication } from '@prisma/client';

function filterLiked(liked: any, query: string) {
	if (query !== '') {
		const p = liked;
		const searcher = new Fuse(p, {
			keys: [
				{ name: 'title', weight: 0.4 },
				{ name: 'description', weight: 0.4 },
				{ name: 'learningObjectives', weight: 0.2 },
			],
			isCaseSensitive: false,
			threshold: 0.6,
			shouldSort: true,
		});
		liked = searcher.search(query).map((m) => m.item);
	}
	return liked;
}


/**
 * Gets the liked publications of a user
 * @param params
 * @param locals
 */
export async function GET({ params, url, locals }) {
	const { id } = params;

	// const authError = await verifyAuth(locals, id);
	// if (authError) return authError;

	const user = await getUserById(id);
	if (!user)
		return new Response(JSON.stringify({ error: 'User not found' }), {
			status: 404,
		});

	const query: string = url.searchParams.get('q') || '';
	const likedResponse = await getLikedPublications(id);
	// console.log(likedResponse.liked);
	if (likedResponse === null)
		return new Response(JSON.stringify({ error: 'Server error' }), {
			status: 500,
		});

	let liked;
	const fileData: FetchedFileArray = [];
	if (url.searchParams.get('fullPublications') === 'true') {
		liked = likedResponse.liked;
		// console.log(liked);
		const temp = [];
		for (const publication of liked){
			if (publication.materials === null) {
				const coverPicData = await coverPicFetcher(
					null,
					publication.coverPic
				)
				temp.push({ ...publication, coverPicData: coverPicData });
			} else {
				temp.push({
					...publication,
					coverPicData: (await coverPicFetcher(
						publication.materials.encapsulatingType,
						publication.coverPic,
					)).data,
				});
				fileData.push(await(
					coverPicFetcher(
						publication.materials.encapsulatingType,
						publication.coverPic,
					)),
				);
			}
			liked = temp;
		}
	} else {
		liked = likedResponse.liked.map((x) => x.id);	if (liked.length === 0) return new Response(null, { status: 204 });
		return new Response(
				JSON.stringify(
					liked
				),
				{
					status: 200,
				},
			);
	}
	liked = filterLiked(liked, query);
	if (liked.length === 0) return new Response(null, { status: 204 });
	return new Response(
			JSON.stringify({
				liked: liked,
				likedFileData: fileData,
				ids: liked.map((x: Publication) => x.id),
			}),
			{
				status: 200,
			},
		);
	// return new Response(JSON.stringify(liked), { status: 200 });
}
