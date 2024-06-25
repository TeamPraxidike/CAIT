import {
	coverPicFetcher,
	type FetchedFileArray,
	fileSystem,
	getSavedPublications,
	getUserById,
} from '$lib/database';
import { verifyAuth } from '$lib/database/auth';
import { profilePicFetcher } from '$lib/database/file';
import Fuse from 'fuse.js';
import type { Publication } from '@prisma/client';

function filterSaved(saved: any, query: string) {
	if (query !== '') {
		const p = saved;
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
		saved = searcher.search(query).map((m) => m.item);
	}
	return saved;
}

/**
 * Returns all saved publications of a user
 * @param params
 * @param url
 * @param locals
 */
export async function GET({ params, url, locals }) {
	const authError = await verifyAuth(locals);
	if (authError) return authError;

	const { id } = params;

	const user = await getUserById(id);
	if (!user)
		return new Response(JSON.stringify({ error: 'User not found' }), {
			status: 404,
		});
	const query: string = url.searchParams.get('q') || '';
	const savedResponse = await getSavedPublications(id);
	if (savedResponse === null)
		return new Response(JSON.stringify({ error: 'Server error' }), {
			status: 500,
		});

	let saved;
	const fileData: FetchedFileArray = [];

	if (url.searchParams.get('fullPublications') === 'true') {
		saved = savedResponse.saved;
		const temp = [];
		for (const publication of saved) {
			if (publication.materials === null) {
				const filePath = publication.coverPic!.path;
				const currentFileData = fileSystem.readFile(filePath);
				const coverPicData = currentFileData.toString('base64');
				temp.push({ ...publication, coverPicData: coverPicData });
			} else {
				temp.push({
					...publication,
					coverPicData: coverPicFetcher(
						publication.materials.encapsulatingType,
						publication.coverPic,
					).data,
				});
				fileData.push(
					coverPicFetcher(
						publication.materials.encapsulatingType,
						publication.coverPic,
					),
				);
			}
			saved = temp;
		}

		saved = saved.map((x) => {
			return {
				...x,
				publisher: {
					...x.publisher,
					profilePicData: profilePicFetcher(x.publisher.profilePic)
						.data,
				},
			};
		});
	} else saved = savedResponse.saved.map((x) => x.id);

	saved = filterSaved(saved, query);
	if (saved.length === 0) return new Response(null, { status: 204 });

	return new Response(
		JSON.stringify({
			saved: saved,
			savedFileData: fileData,
			ids: saved.map((x: Publication) => x.id),
		}),
		{
			status: 200,
		},
	);
}
