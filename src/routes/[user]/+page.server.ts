import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, fetch }) => {
	const materialsRes = await fetch(`/api/material?publishers=${params.user}`);

	if (materialsRes.status !== 200) {
		return {
			status: materialsRes.status,
			error: materialsRes.statusText,
		};
	}
	const { materials, fileData } = await materialsRes.json();
	console.log('materialsRes', materials);
	return { materials, fileData };
};
