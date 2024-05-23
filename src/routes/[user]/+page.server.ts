import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, fetch }) => {
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
	const {saved, savedFileData} = savedRes.status === 204 ? {saved: [], savedFileData: []} : await savedRes.json();
	console.log('saved', savedFileData);
	const { materials, fileData } = await materialsRes.json();
	console.log('materialsRes', materials);
	return { materials, fileData, saved, savedFileData }
};
