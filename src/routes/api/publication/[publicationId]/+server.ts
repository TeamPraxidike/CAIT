import {
	coverPicFetcher,
	type FetchedFileArray,
	type FetchedFileItem,
	fileSystem,
	getMaterialByPublicationId,
	getPublicationById,
} from '$lib/database';

export async function GET({ params }) {
	// Authentication step
	// return 401 if user not authenticated

	const publicationId = parseInt(params.publicationId);

	if (isNaN(publicationId) || publicationId <= 0) {
		return new Response(
			JSON.stringify({ error: 'Bad Request - Invalid ID' }),
			{
				status: 400,
			},
		);
	}

	try {
		const publication = await getPublicationById(publicationId);
		if (!publication) {
			return new Response(
				JSON.stringify({ error: 'Material Not Found' }),
				{
					status: 404,
				},
			);
		}

		if (publication.materials) {
			//const material = await getMaterialByPublicationId(publicationId);
			const fileData: FetchedFileArray = [];

			for (const file of publication.materials.files) {
				const currentFileData = fileSystem.readFile(file.path);
				fileData.push({
					fileId: file.path,
					data: currentFileData.toString('base64'),
				});
			}

			// coverPic return
			const coverFileData: FetchedFileItem = coverPicFetcher(
				publication.materials.encapsulatingType,
				publication.coverPic,
			);

			return new Response(
				JSON.stringify({
					isMaterial: true,
					publication: publication,
					fileData,
					coverFileData,
				}),
				{
					status: 200,
				},
			);
		} else {
			return new Response(
				JSON.stringify({
					isMaterial: false,
					publication: publication,
					fileData: {},
					coverFileData: {},
				}),
				{
					status: 200,
				},
			);
		}

		// file content for return
	} catch (error) {
		return new Response(JSON.stringify({ error: 'Server Error' }), {
			status: 500,
		});
	}
}
