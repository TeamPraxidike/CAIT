import {getPublicationById, getUserById} from "$lib/database";
import {isPublicationLiked} from "$lib/database/user";
import {isPublicationSaved} from "$lib/database/save";

/**
 * Returns user specific information for a publications, like whether it is liked or saved
 * @param params
 * @constructor
 */
export async function GET({params}) {
    const {id, publicationId} = params;

    const user = await getUserById(parseInt(id));
    if(!user) return new Response(JSON.stringify({error: 'User not found'}), {status: 404});

    const publication = await getPublicationById(parseInt(publicationId));
    if(!publication) return new Response(JSON.stringify({error: 'Publication not found'}), {status: 404});

    try {
        const liked = await isPublicationLiked(parseInt(id), parseInt(publicationId));
        const saved = await isPublicationSaved(parseInt(id), parseInt(publicationId));
        return new Response(JSON.stringify({saved, liked}), {status: 200});
    } catch (error) {
        return new Response(JSON.stringify({error}), {status: 500});
    }
}