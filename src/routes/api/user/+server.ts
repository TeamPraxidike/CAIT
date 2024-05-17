import { createUser, prisma } from '$lib/database';

export async function POST({ request }) {
	// authentication step here
	const userjson = await request.json();
	try {
		const user = await createUser(
			userjson.firstName,
			userjson.lastName,
			userjson.email,
			userjson.profilePic,
		);
		return new Response(JSON.stringify({ user }), { status: 200 });
	} catch (error) {
		return new Response(JSON.stringify({ error }), { status: 500 });
	}
}

// get all users
export async function GET() {
	try {
		const users = await prisma.user.findMany();
		return new Response(JSON.stringify(users), { status: 200 });
	} catch (error) {
		return new Response(JSON.stringify({ error }), { status: 500 });
	}
}
