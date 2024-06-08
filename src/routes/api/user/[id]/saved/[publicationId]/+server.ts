import {
	getPublicationById,
	getUserById,
	savePublication,
	updateAllTimeSaved,
	updateReputation,
} from '$lib/database';

/**
 * Saves a publication to a user's saved list
 * @param params
 */
export async function POST({ params }) {
	const { id, publicationId } = params;
	const user = await getUserById(id);
	if (!user)
		return new Response(JSON.stringify({ error: 'User not found' }), {
			status: 404,
		});

	const publication = await getPublicationById(parseInt(publicationId));
	if (!publication)
		return new Response(
			JSON.stringify({ error: 'Publication not found' }),
			{ status: 404 },
		);

	try {
		const response = await savePublication(id, parseInt(publicationId));
		if (id !== publication.publisherId) {
			if (response === 'Publication saved successfully') {
				const savedBefore = await updateAllTimeSaved(
					id,
					parseInt(publicationId),
				);
				if (savedBefore !== 'User saved previously') {
					await updateReputation(publication.publisherId, 10);
				}
			}
		}
		return new Response(JSON.stringify({ message: response }), {
			status: 200,
		});
	} catch (error) {
		return new Response(JSON.stringify({ error }), { status: 500 });
	}
}
