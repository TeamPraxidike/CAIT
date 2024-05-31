import { prisma } from '$lib/database';
import { profilePicFetcher } from '$lib/database/file';

// /**
//  * Create a new user
//  * @deprecated This is a deprecated function.
//  * @param request
//  * @constructor
//  */
// export async function POST({ request }) {
// 	// authentication step here
// 	const body: UserForm = await request.json();
// 	try {
// 		const user = await prisma.$transaction(async (prismaTransaction) => {
// 			// @ts-ignore
// 			const user = await createUser(body.metaData, prismaTransaction);
//
// 			await updateProfilePic(body.profilePic, user.id, prismaTransaction);
//
// 			return user;
// 		});
//
// 		return new Response(JSON.stringify({ user }), { status: 200 });
// 	} catch (error) {
// 		console.error(error);
// 		return new Response(JSON.stringify({ error }), { status: 500 });
// 	}
// }

// get all users
export async function GET() {
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
