import { createUser, prisma, type UserCreateForm } from '$lib/database';
import { profilePicFetcher, updateProfilePic } from '$lib/database/file';
import type { PrismaClient } from '@prisma/client';
import type { UserPosts, User } from '$lib/database/user';

/**
 * Create a new user
 * @param request
 * @constructor
 */
export async function POST({ request }) {
	// authentication step here
	const body: UserCreateForm = await request.json();
	try {
		const user: User = await prisma.$transaction(async (prismaTransaction: PrismaClient) => {
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
export async function GET() {
	try {
		let users: UserPosts[] = await prisma.user.findMany({
			include: {
				posts: true,
				profilePic: true,
			},
		});

		users = await Promise.all(users.map(async (user) => {
			return {
				...user,
				profilePicData: (await profilePicFetcher(user.profilePic)).data,
			};
		}));
		return new Response(JSON.stringify({ users }), { status: 200 });
	} catch (error) {
		return new Response(JSON.stringify({ error }), { status: 500 });
	}
}
