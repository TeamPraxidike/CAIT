import { verifyAuth } from '$lib/database/auth';
import {
	coverPicFetcher,
	fileSystem,
	getAllCircuits,
	getCircuitByPublicationId
} from '$lib/database';
import { profilePicFetcher } from '$lib/database/file';
import { getCircuitsContainingPublication } from '$lib/database/circuit';

export async function GET({ locals, params }) {
	const authError = await verifyAuth(locals);
	if (authError) return authError;

	try {
		const publicationId = parseInt(params.publicationId);
		if (isNaN(publicationId) || publicationId <= 0) {
			return new Response(
				JSON.stringify({ error: 'Bad Request - Invalid ID' }),
				{
					status: 400,
				},
			);
		}

		let circuits = await getCircuitsContainingPublication(publicationId);

		if (!circuits) {
			return new Response(
				JSON.stringify({ error: 'No such publication found' }),
				{
					status: 404,
				},
			);
		}

		circuits = await Promise.all(circuits.map(async (circuit) => {
			const filePath = circuit.publication.coverPic!.path;

			const currentFileData = await fileSystem.readFile(filePath);

			return {
				...circuit,
				publisher: {
					...circuit.publication.publisher,
					profilePicData: (await profilePicFetcher(
						circuit.publication.publisher.profilePic,
					)).data,
				},
				coverPicData: (await coverPicFetcher(
					circuit.publication.coverPic!.path
				)).data,
			};
		}));
		return new Response(JSON.stringify(circuits), { status: 200 });
	} catch (error) {
		return new Response(JSON.stringify({ error: 'Server Error' }), {
			status: 500,
		});
	}
}
