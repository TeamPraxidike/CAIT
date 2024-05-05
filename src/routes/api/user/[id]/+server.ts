import {getUserById} from "$lib/db";

export async function GET({ params }) {
    const { id } = params;
    try {
        const user = await getUserById(parseInt(id));
        if (!user) return new Response(JSON.stringify({ error: 'Publication not found' }), { status: 404 });
        return new Response(JSON.stringify(user), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error }), { status: 500 });
    }
}