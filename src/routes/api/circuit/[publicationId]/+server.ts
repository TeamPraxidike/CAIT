import { getCircuitByPublicationId } from '$lib/database/circuit';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params }) => {
	// Authentication step
	// return 401 if user not authenticated

	const publicationId = Number(params.publicationId);

	if (isNaN(publicationId) || publicationId <= 0) {
		return new Response(JSON.stringify({ error: 'Bad Request - Invalid ID' }), {
			status: 400,
		});
	}

	try {
		const material = await getCircuitByPublicationId(publicationId);
		if (!material) {
			return new Response(JSON.stringify({ error: 'Circuit Not Found' }), {
				status: 404,
			});
		}
		return new Response(JSON.stringify(material), { status: 200 });
	} catch (error) {
		return new Response(JSON.stringify({ error: 'Server Error' }), {
			status: 500,
		});
	}
};
