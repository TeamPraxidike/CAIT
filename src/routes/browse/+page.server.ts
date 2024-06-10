import type { FetchedFileArray } from '$lib/database';
import type { User } from '@prisma/client';

export async function load({ url, fetch, locals }) {
	const session = await locals.auth();

	const type = url.searchParams.get('type') || 'materials';

	const { materials } =
		type === 'materials'
			? await (await fetch(`/api/material`)).json()
			: { materials: [] };
	const circuits =
		type === 'circuits'
			? await (await fetch(`/api/circuit`)).json()
			: { circuits: [] };
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

	return {
		type,
		materials,
		users,
		circuits,
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
		publisher: User & {
			profilePicData: string;
		};
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
