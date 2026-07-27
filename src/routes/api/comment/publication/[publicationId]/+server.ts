import { getCommentsByPublicationId } from '$lib/database';
import { verifyAuth } from '$lib/database/auth';

export async function GET({ params, locals }) {
	const authError = await verifyAuth(locals);
	if (authError) return authError;
	const { publicationId } = params;
	try {
		let comment;
		try{
			comment = await getCommentsByPublicationId(
				parseInt(publicationId),
			);
		} catch (err){
			return new Response(JSON.stringify({ error: "could not find said publication" }), { status: 404 });
		}
		
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
