import { getCommentsByPublicationId } from '$lib/database';
import { verifyAuth } from '$lib/database/auth';
import { canViewPublication } from '$lib/server/draftShare';

export async function GET({ params, locals, url }) {
	const authError = await verifyAuth(locals);
	if (authError) return authError;
	const { publicationId } = params;
	const parsedPublicationId = parseInt(publicationId);
	if (isNaN(parsedPublicationId) || parsedPublicationId <= 0) {
		return new Response(JSON.stringify({ error: 'Invalid publication ID' }), {
			status: 400,
		});
	}
	try {
		const mayView = await canViewPublication(
			parsedPublicationId,
			locals.user?.id,
			url.searchParams.get('draftToken'),
		);
		if (!mayView) {
			return new Response(JSON.stringify({ error: 'Publication not found' }), {
				status: 404,
			});
		}

		const comment = await getCommentsByPublicationId(
			parsedPublicationId,
		);
		if (!comment)
			return new Response(
				JSON.stringify({ error: 'Comments for publication not found' }),
				{
					status: 404,
				},
			);
		return new Response(JSON.stringify(comment), { status: 200 });
	} catch (error) {
		return new Response(JSON.stringify({ error }), { status: 500 });
	}
}
