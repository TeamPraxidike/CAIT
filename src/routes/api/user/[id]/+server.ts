import {getUserById} from "$lib/database";
import {deleteUser} from "$lib/database/user";

export async function GET({ params }) {
	const { id } = params;
	try {
		const user = await getUserById(parseInt(id));
		if (!user) return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
		return new Response(JSON.stringify(user), { status: 200 });
	} catch (error) {
		return new Response(JSON.stringify({ error }), { status: 500 });
	}
}

export async function DELETE({ params }) {
	const { id } = params;

	try {
		const user = await deleteUser(parseInt(id));
		return new Response(JSON.stringify(user), { status: 200 });
	} catch (RecordNotFound) {
		return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
	}
}


// export async function PUT({ params }) {
//     const { id } = params;
//     try {
//         const user = await getUserById(parseInt(id));
//         if (!user) return new Response(JSON.stringify({ error: 'Publication not found' }), { status: 404 });
//         return new Response(JSON.stringify(user), { status: 200 });
//     } catch (error) {
//         return new Response(JSON.stringify({ error }), { status: 500 });
//     }
// }



