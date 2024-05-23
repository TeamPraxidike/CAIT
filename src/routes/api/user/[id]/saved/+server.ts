import {getSavedPublications, getUserById} from "$lib/database";

/**
 * Returns all saved publications of a user
 * @param params
 */
export async function GET({params}) {
    const {id} = params;

    const user = await getUserById(parseInt(id));
    if(!user) return new Response(JSON.stringify({error: 'User not found'}), {status: 404});

    const savedResponse = await getSavedPublications(parseInt(id));
    if(savedResponse === null) return new Response(JSON.stringify({error: 'Server error'}), {status: 500});
    const saved = savedResponse.saved.map((x) => x.id);
    if(saved.length === 0) return new Response(null, {status: 204});

    return new Response(JSON.stringify(saved), {status: 200});
}

