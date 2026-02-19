import type { FetchedFileArray } from '$lib/database';
import type { User } from '@prisma/client';

export async function load({ url, fetch, locals }) {
	const session = await locals.safeGetSession();

	const type = url.searchParams.get('type') || 'materials';


	async function fetchMaterials() {
		

		try{
			const res = await fetch(`/api/material`);

			if (!res.ok) {
				throw new Error(`Failed to load materials in browse: ${res.statusText}`);
			}

			return res.json();
		}
		catch (err) {
			console.error('Error while getting materials, page.server:\n', err);
		}

	}

	async function fetchCircuits() {

		try{
			const res = await fetch(`/api/circuit`);

			if (!res.ok) {
				throw new Error(`Failed to load circuits in browse: ${res.statusText}`);
			}

			return res.json();
		}
		catch (err) {
			console.error('Error while getting circuits, page.server:\n', err);
		}

	}


	async function fetchUsers() {

		try{
			const res = await fetch(`/api/user`);

			if (!res.ok) {
				throw new Error(`Failed to fetch users in browse: ${res.statusText}`);
			}

			return res.json();
		}
		catch (err) {
			console.error('Error while getting users, page.server:\n', err);
		}

	}

	async function fetchCourses() {
		try{
			const res = await fetch(`/api/course-extended`);

			if (!res.ok) {
				throw new Error(`Failed to load courses in browse: ${res.statusText}`);
			}
			return res.json();
		}
		catch (err) {
			console.error('Error while getting courses, page.server:\n', err);
		}

	}


	let liked: number[] = [];
	let saved: { saved: number[]; savedFileData: FetchedFileArray } = {
		saved: [],
		savedFileData: [],
	};
	let tags: { content: string }[] = [];

	const selectedTag = url.searchParams.get('tags') || '';

	if (session && session.user) {
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
		selectedTag,
		type,
		// materials,
		// users,
		// circuits,
		materials: fetchMaterials(),
		users: fetchUsers(),
		circuits: fetchCircuits(),
		courses: fetchCourses(),
		tags,
		liked,
		saved,
		// idsMat,
		// idsCirc,
		amount: 9,
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
