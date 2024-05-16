import {
	deleteMaterialByPublicationId,
	getMaterialByPublicationId,
} from '$lib/database/material';

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
		const material = await getMaterialByPublicationId(publicationId);
		if (!material) {
			return new Response(JSON.stringify({ error: 'Material Not Found' }), {
				status: 404,
			});
		}
		return new Response(JSON.stringify(material), { status: 200 });
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
			JSON.stringify({ error: 'Bad Delete Request - Invalid Material Id' }),
			{ status: 400 },
		);
	}
	try {
		const material = await getMaterialByPublicationId(id);
		if (!material) {
			return new Response(JSON.stringify({ error: 'Material Not Found' }), {
				status: 404,
			});
		}
		await deleteMaterialByPublicationId(id);
		return new Response(JSON.stringify(material), { status: 200 });
	} catch (error) {
		return new Response(JSON.stringify({ error: 'Server Error' }), {
			status: 500,
		});
	}
}
