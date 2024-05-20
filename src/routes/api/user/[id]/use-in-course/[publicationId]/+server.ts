import {getSavedPublications, getUserById, publicationsAUserUses} from "$lib/database";

export async function POST({params}) {
    const {id, publicationId} = params;
    const user = await getUserById(parseInt(id));
    if(!user) return new Response(JSON.stringify({error: 'User not found'}), {status: 404});

    const used = await publicationsAUserUses(parseInt(id));
    if(used === null) return new Response(JSON.stringify({error: 'Server error'}), {status: 500});
    if(used.length === 0) return new Response(null, {status: 204});

    return new Response(JSON.stringify(used), {status: 200});
}

