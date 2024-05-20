import {coursesUsingPublication, getPublicationById} from "$lib/database";

export async function GET({params}) {
    const {publicationId} = params;

    const publication = await getPublicationById(parseInt(publicationId));
    if(!publication) return new Response(JSON.stringify({error: 'Publication not found'}), {status: 404});

    try{
        const courses = await coursesUsingPublication(parseInt(publicationId));
        if(courses.length === 0) return new Response(null, {status: 204});
        else return new Response(JSON.stringify(courses), {status: 200});
    } catch (error) {
        return new Response("Server error", {status: 500});
    }
}