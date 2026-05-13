import type { UserSanitizedWithProfilePicData } from '$lib';

export async function load({ fetch }) {
	const res = await fetch("/api/user/highest-rep");
	const users: UserSanitizedWithProfilePicData[] = (await res.json()).usersProfilePics;

	return {"topUsers": users};
}