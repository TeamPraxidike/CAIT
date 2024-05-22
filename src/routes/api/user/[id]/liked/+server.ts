import {getLikedPublications, getUserById} from "$lib/database";

/**
 * Gets the liked publications of a user
 * @param params
 */
export async function GET({params}) {
    const {id} = params;
    const user = await getUserById(parseInt(id));
    if(!user) return new Response(JSON.stringify({error: 'User not found'}), {status: 404});

    const liked = await getLikedPublications(parseInt(id));
    if(liked === null) return new Response(JSON.stringify({error: 'Server error'}), {status: 500});
    if(liked.liked.length === 0) return new Response(null, {status: 204});

    return new Response(JSON.stringify(liked.liked), {status: 200});
}

