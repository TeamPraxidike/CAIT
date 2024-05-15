import {createUser} from "$lib/database";

export async function POST({ request }) {
    // authentication step here
    console.log("here");
    const userjson = await request.json();
    console.log("here2");
    try {
        const user = await createUser(userjson.firstName, userjson.lastName, userjson.email, userjson.profilePic);
        console.log("here3");
        return new Response(JSON.stringify({ user }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error }), { status: 500 });
    }
}
