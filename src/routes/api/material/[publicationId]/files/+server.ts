import { verifyAuth } from '$lib/database/auth';
import {
	type FetchedFileArray,
	fileSystem,
	getMaterialByPublicationId
} from '$lib/database';

export async function GET({ params, locals }) {
	const authError = await verifyAuth(locals);
	if (authError) return authError;

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
		const material = await getMaterialByPublicationId(publicationId);

		if (!material) {
			return new Response(
				JSON.stringify({ error: 'Material Not Found' }),
				{
					status: 404,
				},
			);
		}

		// file content for return
		const fileData: FetchedFileArray = [];

		for (const file of material.files) {
			const currentFileData = await fileSystem.readFile(file.path);
			fileData.push({
				fileId: file.path,
				data: currentFileData.toString('base64'),
			});
		}

		return new Response(
			JSON.stringify(fileData),
			{
				status: 200,
			},
		);
	} catch (error) {
		console.error(error);
		return new Response(JSON.stringify({ error: 'Server Error' }), {
			status: 500,
		});
	}
}