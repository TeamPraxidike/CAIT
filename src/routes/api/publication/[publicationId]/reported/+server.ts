import {verifyAuth} from "$lib/database/auth";
import {getPublicationById} from "$lib/database";
import {getReportsPublication} from "$lib/database/publication";
import {isReported} from "$lib/database/user";

/**
 * If you are an admin this returns all reports for a publication. If you are a user this returns just whether you have reported it
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
    const { publicationId } = params;
    if(!session.user.isAdmin) return isPublicationReported(parseInt(publicationId), session.user.id)

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

/**
 * See whether a publication is reported by a user
 * @constructor
 * @param publicationId
 * @param userId
 */
async function isPublicationReported(publicationId: number, userId: string) {
    const publication = await getPublicationById(publicationId);
    if (!publication)
        return new Response(
            JSON.stringify({ error: 'Publication not found' }),
            { status: 404 },
        );

    try {
        const reported = await isReported(userId, publicationId);
        return new Response(JSON.stringify(reported), { status: 200 });
    } catch (error) {
        return new Response('Server error', { status: 500 });
    }
}