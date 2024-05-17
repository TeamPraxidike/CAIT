import {getPublicationById, getUserById, likePublication} from "$lib/database";


export async function POST({params}) {
    const {id, publicationId} = params;
    const user = await getUserById(parseInt(id));
    if(!user) return new Response(JSON.stringify({error: 'User not found'}), {status: 404});

    const publication = await getPublicationById(parseInt(publicationId));
    if(!publication) return new Response(JSON.stringify({error: 'Publication not found'}), {status: 404});

    try {
        const response = await likePublication(parseInt(id), parseInt(publicationId));
        return new Response(JSON.stringify({message: response}), {status: 200});
    } catch (error) {
        return new Response(JSON.stringify({error}), {status: 500});
    }
}