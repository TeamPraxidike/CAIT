import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, fetch , cookies}) => {
	const materialsRes = await fetch(`/api/material?publishers=${params.user}`);

	if (materialsRes.status !== 200) {
		return {
			status: materialsRes.status,
			error: materialsRes.statusText,
		};
	}

	const savedRes = await fetch(`/api/user/${params.user}/saved?fullPublications=true`);

	if (![200, 204].includes(savedRes.status)) {
		throw new Error('Failed to fetch saved materials');
	}

	const likedResponse = await fetch(`/api/user/${cookies.get("userId")}/liked`);
	const liked = likedResponse.status === 200 ? await likedResponse.json() : [];

	const {saved, savedFileData} = savedRes.status === 204 ? {saved: [], savedFileData: []} : await savedRes.json();
	const { materials, fileData } = await materialsRes.json();
	// console.log('materialsRes', materials);
	return { materials, fileData, saved, savedFileData, liked }
};
