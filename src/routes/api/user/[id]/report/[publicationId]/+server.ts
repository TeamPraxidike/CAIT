import {verifyAuth} from "$lib/database/auth";
import {getPublicationById, getUserById} from "$lib/database";
import {reportPublication} from "$lib/database/user";

/**
 * report a publication
 * @param params
 * @param locals
 * @constructor
 */
export async function POST({ params, locals }) {
    const authError = await verifyAuth(locals);
    if (authError) return authError;

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
        await reportPublication(id, parseInt(publicationId));

        return new Response(JSON.stringify({ message: "Succesfully reported publication" }), {
            status: 200,
        });
    } catch (error) {
        return new Response(JSON.stringify({ error }), { status: 500 });
    }
}