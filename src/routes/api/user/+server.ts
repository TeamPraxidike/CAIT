import {createUser, type FetchedFileArray, prisma, type UserForm} from '$lib/database';
import {profilePicFetcher, updateProfilePic} from "$lib/database/file";

export async function POST({ request }) {
	// authentication step here
	const body: UserForm = await request.json();
	try {
		const user = await prisma.$transaction(
			async (prismaTransaction) => {
				const user = await createUser(
					body.metaData,
					prismaTransaction
				);

				await updateProfilePic(body.profilePic, user.id, prismaTransaction);

				return user;
			})

		return new Response(JSON.stringify({ user }), { status: 200 });
	} catch (error) {
		return new Response(JSON.stringify({ error }), { status: 500 });
	}
}

// get all users
export async function GET() {
	try {
		const users = await prisma.user.findMany({
			include: {
				profilePic: true
			}
		});

		// profilePic return
		const profilePicData: FetchedFileArray = [];

		for (const user of users) {
			profilePicData.push(
				profilePicFetcher(
					user.profilePic
				),
			);
		}
		return new Response(JSON.stringify({users, profilePicData}), { status: 200 });
	} catch (error) {
		return new Response(JSON.stringify({ error }), { status: 500 });
	}
}
