import {
	getCircuitByPublicationId,
	deleteCircuitByPublicationId,
} from '$lib/database';
import { json } from '@sveltejs/kit';

export async function GET({ params }) {
	// Authentication step
	// return 401 if user not authenticated

	const publicationId = parseInt(params.publicationId);

	if (isNaN(publicationId) || publicationId <= 0) {
		return new Response(JSON.stringify({ error: 'Bad Request - Invalid ID' }), {
			status: 400,
		});
	}

	try {
		const circuit = await getCircuitByPublicationId(publicationId);
		if (!circuit) {
			return new Response(JSON.stringify({ error: 'Circuit Not Found' }), {
				status: 404,
			});
		}
		return new Response(JSON.stringify(circuit), { status: 200 });
	} catch (error) {
		return new Response(JSON.stringify({ error: 'Server Error' }), {
			status: 500,
		});
	}
}

export async function DELETE({ params }) {
	const publicationId = parseInt(params.publicationId);
	if (isNaN(publicationId) || publicationId <= 0) {
		return json(
			{ error: 'Bad Delete Request - Invalid Circuit Id' },
			{ status: 400 },
		);
	}
	try {
		const circuit = await deleteCircuitByPublicationId(publicationId);
		if (!circuit) {
			return json({ error: 'Circuit Not Found' }, { status: 404 });
		}
		return json(
			{ message: 'Successful deletion of circuit' + publicationId },
			{ status: 200 },
		);
	} catch (error) {
		return json({ error: 'Server Error ' }, { status: 500 });
	}
}
