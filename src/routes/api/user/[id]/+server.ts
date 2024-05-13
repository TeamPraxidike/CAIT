import {getUserById} from "$lib/database/db";

export async function GET({ params }) {
    try {
        const user = await getUserById(parseInt(params.id));
        if (!user) return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
        return new Response(JSON.stringify(user), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error }), { status: 500 });
    }
}