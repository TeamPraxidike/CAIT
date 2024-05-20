import {
    addPublicationToUsedInCourse,
    getPublicationById,
    getUserById,
} from "$lib/database";

export async function POST({params, request}) {
    const {id, publicationId} = params;
    const user = await getUserById(parseInt(id));
    if(!user) return new Response(JSON.stringify({error: 'User not found'}), {status: 404});

    const publication = await getPublicationById(parseInt(publicationId));
    if(!publication) return new Response(JSON.stringify({error: 'Publication not found'}), {status: 404});

    const body = await request.json();
    try{
        await addPublicationToUsedInCourse(parseInt(id), parseInt(publicationId), body.courses);
        return new Response("Successfully marked usage of publication", {status: 200});
    } catch (error) {
        return new Response("Server error", {status: 500});
    }
}

