import {verifyAuth} from "$lib/database/auth";
import {getPublicationById} from "$lib/database";
import {getReportsPublication} from "$lib/database/publication";

/**
 * See the number of reports on a publication. You can only do that if you are an admin
 * @param params
 * @param locals
 * @constructor
 */
export async function GET({ params, locals }) {
    const authError = await verifyAuth(locals);
    if (authError) return authError;

    const session = await locals.auth();
    if(session === null) return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
    });
    if(!session.user.isAdmin) return new Response(JSON.stringify({ error: 'User is not an admin' }), {
        status: 401,
    });

    const { publicationId } = params;

    const publication = await getPublicationById(parseInt(publicationId));
    if (!publication)
        return new Response(
            JSON.stringify({ error: 'Publication not found' }),
            { status: 404 },
        );

    try {
        const courses = await getReportsPublication(parseInt(publicationId));
        if(courses === null) return new Response('Server error', { status: 500 });
        return new Response(JSON.stringify(courses._count.reportedBy), { status: 200 });
    } catch (error) {
        return new Response('Server error', { status: 500 });
    }
}