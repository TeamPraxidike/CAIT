import { profilePicFetcher } from '$lib/database/file.ts';
import { getTopKUsers, type UserSanitized } from '$lib/database/user.ts';
import type { UserSanitizedWithProfilePicData } from '$lib';


export async function GET() {
	try {

		const users = await getTopKUsers(4);
		const usersProfilePics: UserSanitizedWithProfilePicData[] = await Promise.all(users.map(async (user: UserSanitized) => {
			return {
				...user,
				profilePicData: (await profilePicFetcher(user.profilePic)).data,
			};
		}));
		return new Response(JSON.stringify({ usersProfilePics }), { status: 200 });
	} catch (error) {
		return new Response(JSON.stringify({ error }), { status: 500 });
	}
}