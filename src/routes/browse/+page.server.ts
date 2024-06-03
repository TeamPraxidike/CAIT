import type {FetchedFileArray} from "$lib/database";

export async function load({ url, fetch, locals }) {
	const session = await locals.auth();

	const type = url.searchParams.get('type') || 'materials';

	// get all the materials
	const { materials, fileData } = await (await fetch(`/api/material`)).json();
	const { users, profilePics } = await (await fetch(`/api/user`)).json();


	let liked: number[] = [];
	let saved: {saved: number[], savedFileData: FetchedFileArray} = {saved: [], savedFileData: []};
	let tags: {content: string}[] = [];

	if (session !== null) {
		const likedResponse = await fetch(`/api/user/${session.user.id}/liked`);
		liked = likedResponse.status === 200 ? await likedResponse.json() : [];

		const savedResponse = await fetch(
			`/api/user/${session.user.id}/saved?fullPublications=false`,
		);
		saved = savedResponse.status === 200 ? await savedResponse.json() : [];

		tags = await (await fetch(`/api/tags`)).json();
	}

	return {
		type,
		materials,
		fileData,
		users,
		tags,
		liked,
		saved,
		profilePics,
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
