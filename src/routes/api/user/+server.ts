import { createUser, prisma, type UserCreateForm } from '$lib/database';
import { profilePicFetcher, updateProfilePic } from '$lib/database/file';
import { verifyAuth } from '$lib/database/auth';

/**
 * Create a new user
 * @param request
 * @constructor
 */
export async function POST({ request }) {

	// authentication step here
	const body: UserCreateForm = await request.json();
	try {
		const user = await prisma.$transaction(async (prismaTransaction) => {
			const user = await createUser(body.metaData, prismaTransaction);

			await updateProfilePic(null, user.id, prismaTransaction);

			return user;
		});

		return new Response(JSON.stringify({ user }), { status: 200 });
	} catch (error: any) {
		console.error(error);

		if (error.code === 'P2002') {
			return new Response(JSON.stringify('Email already exists'), {
				status: 400,
				statusText: 'Email already exists',
			});
		}

		return new Response(JSON.stringify({ error }), { status: 500 });
	}
}

// get all users
export async function GET({ locals }) {
	const authError = await verifyAuth(locals);
	if (authError) return authError;

	try {
		let users = await prisma.user.findMany({
			include: {
				profilePic: true,
			},
		});

		users = users.map((user) => {
			return {
				...user,
				profilePicData: profilePicFetcher(user.profilePic).data,
			};
		});
		return new Response(JSON.stringify({ users }), { status: 200 });
	} catch (error) {
		return new Response(JSON.stringify({ error }), { status: 500 });
	}
}
