import {
	coverPicFetcher,
	type FetchedFileArray,
	getSavedPublications,
	getUserById,
} from '$lib/database';
import { verifyAuth } from '$lib/database/auth';
import { profilePicFetcher } from '$lib/database/file';

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

	const savedResponse = await getSavedPublications(id);
	if (savedResponse === null)
		return new Response(JSON.stringify({ error: 'Server error' }), {
			status: 500,
		});

	let saved;
	const fileData: FetchedFileArray = [];

	console.log(savedResponse.saved);

	if (url.searchParams.get('fullPublications') === 'true') {
		saved = savedResponse.saved;
		for (const publication of saved) {
			if (publication.materials === null) continue;
			fileData.push(
				coverPicFetcher(
					publication.materials.encapsulatingType,
					publication.coverPic,
				),
			);
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

	if (saved.length === 0) return new Response(null, { status: 204 });

	return new Response(
		JSON.stringify({ saved: saved, savedFileData: fileData }),
		{
			status: 200,
		},
	);
}
