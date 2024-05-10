import type {User} from "@prisma/client";

export async function GET({ params }) {
    const { id } = params;

    try {
        // TODO: REVERT THIS BACK TO NORMAL!
        const user: User = {
            id: 1,
            firstName: 'Franklin D.',
            lastName: 'Roosevelt',
            email: 'franklindroosvelt@usa.gov',
            reputation: 1238,
            isAdmin: false,
        }

        if (id === '1')
            return new Response(JSON.stringify(user), { status: 200 });
        else
            return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });

        // const user = await getUserById(parseInt(id));
        // if (!user) return new Response(JSON.stringify({ error: 'Publication not found' }), { status: 404 });
        // return new Response(JSON.stringify(user), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error }), { status: 500 });
    }
}