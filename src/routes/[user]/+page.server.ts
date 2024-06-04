import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({
	params,
	fetch,
	parent,
	locals,
}) => {
	await parent();

	const session = await locals.auth();
	if (!session) throw redirect(303, '/signin');

	const materialsRes = await fetch(`/api/material?publishers=${params.user}`);

	if (materialsRes.status !== 200) {
		return {
			status: materialsRes.status,
			error: materialsRes.statusText,
		};
	}

	const savedRes = await fetch(
		`/api/user/${params.user}/saved?fullPublications=true`,
	);

	if (![200, 204].includes(savedRes.status)) {
		throw new Error('Failed to fetch saved materials');
	}

	const likedResponse = await fetch(`/api/user/${session.user.id}/liked`);
	const liked =
		likedResponse.status === 200 ? await likedResponse.json() : [];

	const usedResponse = await fetch(
		`/api/user/${session.user.id}/use-in-course`,
	);
	const used = usedResponse.status === 200 ? await usedResponse.json() : [];

	const { saved, savedFileData } =
		savedRes.status === 204
			? { saved: [], savedFileData: [] }
			: await savedRes.json();
	const { materials } = await materialsRes.json();

	return { materials, saved, savedFileData, liked, used };
};

export type PublicationInfo = {
	publication: {
		tags: {
			content: string;
		}[];
	};
	coverPic: {
		path: string;
		title: string;
		type: string;
		coverId: number | null;
		materialId: number | null;
	} | null;
	usedInCourse: {
		course: string;
	}[];
};
