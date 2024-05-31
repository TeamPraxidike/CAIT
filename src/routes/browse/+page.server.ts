export async function load({ url, fetch, cookies}) {
	const userId = cookies.get("userId");
	const type = url.searchParams.get('type') || 'materials';

	// get all the materials
	const { materials, fileData } = await (await fetch(`/api/material`)).json();
	const {users, profilePics} = await (await fetch(`/api/user`)).json();
	const tags = await (await fetch(`/api/tags`)).json();
	const likedResponse = await fetch(`/api/user/${userId}/liked`);
	const liked = likedResponse.status === 200 ? await likedResponse.json() : [];

	const savedResponse = await fetch(`/api/user/${userId}/saved?fullPublications=false`);
	const saved = savedResponse.status === 200 ? await savedResponse.json() : {saved: []};

	return { type, materials, fileData, users, tags, liked, saved, profilePics};
}

export type material = {
	publication:
		{
			tags:
				{
					content: string
				}[],
			coverPic: {
				path: string,
				title: string,
				type: string,
				coverId: number | null,
				materialId: number | null
			} | null,
			usedInCourse: string[]
		}
	}