import {getSavedPublications, getUserById} from "$lib/database";

export async function GET({params}) {
    const {id} = params;
    const user = await getUserById(parseInt(id));
    if(!user) return new Response(JSON.stringify({error: 'User not found'}), {status: 404});

    const saved = await getSavedPublications(parseInt(id));
    if(saved === null) return new Response(JSON.stringify({error: 'Server error'}), {status: 500});
    if(saved.saved.length === 0) return new Response(null, {status: 204});

    return new Response(JSON.stringify(saved.saved), {status: 200});
}

