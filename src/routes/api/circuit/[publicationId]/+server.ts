import {
	getCircuitByPublicationId,
	deleteCircuitByPublicationId,
} from '$lib/database';

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
	const id = parseInt(params.publicationId);
	if (isNaN(id) || id <= 0) {
		return new Response(
			JSON.stringify({ error: 'Bad Delete Request - Invalid Circuit Id' }),
			{ status: 400 },
		);
	}
	try {
		const circuit = await getCircuitByPublicationId(id);
		if (!circuit) {
			return new Response(JSON.stringify({ error: 'Circuit Not Found' }), {
				status: 404,
			});
		}
		await deleteCircuitByPublicationId(id);
		return new Response(JSON.stringify(circuit), { status: 200 });
	} catch (error) {
		return new Response(JSON.stringify({ error: 'Server Error' }), {
			status: 500,
		});
	}
}
