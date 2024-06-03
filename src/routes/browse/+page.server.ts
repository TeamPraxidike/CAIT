import type { FetchedFileArray } from '$lib/database';

export async function load({ url, fetch, locals }) {
	const session = await locals.auth();

	const type = url.searchParams.get('type') || 'materials';

	// get all the materials
	const { materials } = await (await fetch(`/api/material`)).json();
	const { users } = await (await fetch(`/api/user`)).json();

	let liked: number[] = [];
	let saved: { saved: number[]; savedFileData: FetchedFileArray } = {
		saved: [],
		savedFileData: [],
	};
	let tags: { content: string }[] = [];

	if (session !== null) {
		const likedResponse = await fetch(`/api/user/${session.user.id}/liked`);
		liked = likedResponse.status === 200 ? await likedResponse.json() : [];

		const savedResponse = await fetch(
			`/api/user/${session.user.id}/saved?fullPublications=false`,
		);

		// dont ask for some reason it doesnt work if I do await savedResponse.json()
		if (savedResponse.status) {
			const responseBody = await savedResponse.text();
			saved = responseBody
				? JSON.parse(responseBody)
				: { saved: [], savedFileData: [] };
		} else {
			saved = { saved: [], savedFileData: [] };
		}

		tags = await (await fetch(`/api/tags`)).json();
	}

	console.log(materials);

	return {
		type,
		materials,
		users,
		tags,
		liked,
		saved,
	};
}

export type material = {
	publication: {
		tags: {
			content: string;
		}[];
		coverPic: {
			path: string;
			title: string;
			type: string;
			coverId: number | null;
			materialId: number | null;
		} | null;
		usedInCourse: string[];
	};
};
