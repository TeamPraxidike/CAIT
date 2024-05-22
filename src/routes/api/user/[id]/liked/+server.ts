import {getLikedPublications, getUserById} from "$lib/database";

/**
 * Gets the liked publications of a user
 * @param params
 */
export async function GET({params}) {
    const {id} = params;
    const user = await getUserById(parseInt(id));
    if(!user) return new Response(JSON.stringify({error: 'User not found'}), {status: 404});

    const likedResponse = await getLikedPublications(parseInt(id));
    if(likedResponse === null) return new Response(JSON.stringify({error: 'Server error'}), {status: 500});
    const liked = likedResponse.liked.map((x) => x.id);
    if(liked.length === 0) return new Response(null, {status: 204});

    return new Response(JSON.stringify(liked), {status: 200});
}

