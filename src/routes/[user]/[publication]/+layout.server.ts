import type { LayoutServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: LayoutServerLoad = async ({ params, fetch }) => {
	const pRes = await fetch(`/api/material/${params.publication}`);

	if (pRes.status !== 200) {
		error(pRes.status, pRes.statusText);
	}

	return { serverData: await pRes.json() };
};
