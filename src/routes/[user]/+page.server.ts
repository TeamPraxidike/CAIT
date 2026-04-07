import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import type { User } from '@prisma/client';
import { PublicationType } from '@prisma/client';
import type { ExtendedPublication } from '../api/publication/+server';

export const load: PageServerLoad = async ({
	params,
	fetch,
	parent,
	locals,
}) => {
	const layoutData = await parent();

	const session = await locals.safeGetSession();
	if (!session || !session.user) throw redirect(303, '/signin');

	const pubsRes = await fetch(`/api/publication?publishers=${layoutData.user.id}&includeDraft=${session.user.id === layoutData.user.id}`);

	if (pubsRes.status !== 200) {
		return {
			status: pubsRes.status,
			error: pubsRes.statusText,
		};
	}

	// Return the saved publications for the Profile being checked
	let pageUserSavedResponses = await fetch(
		`/api/user/${layoutData.user.id}/saved?fullPublications=true`,
	);
	if (![200, 204].includes(pageUserSavedResponses.status)) {
		throw new Error('Failed to fetch saved materials');
	}

	let pageUserLikedResponses = await fetch(
		`/api/user/${layoutData.user.id}/liked?fullPublications=true`,
	);
	if (![200, 204].includes(pageUserLikedResponses.status)) {
		throw new Error('Failed to fetch saved materials');
	}

	// Fetch saved results to see if the current user has saved these Publications
	const mySavedResults = await fetch(
		`/api/user/${session.user.id}/saved?fullPublications=false`,
	);
	if (![200, 204].includes(mySavedResults.status)) {
		throw new Error('Failed to fetch saved by user materials');
	}

	const myLikedResponses = await fetch(`/api/user/${session.user.id}/liked`);
	const likedByUser =
		myLikedResponses.status === 200 ? await myLikedResponses.json() : [];

	const usedResponse = await fetch(
		`/api/user/${session.user.id}/use-in-course`,
	);
	const used = usedResponse.status === 200 ? await usedResponse.json() : [];

	const savedJson =
		pageUserSavedResponses === null || pageUserSavedResponses.status === 204
			? { saved: [], savedFileData: [] }
			: await pageUserSavedResponses.json();
	const saved = savedJson.saved;
	const savedFileData = savedJson.savedFileData;


	for (let i = 0; i < saved.length; i++) {
		if (saved[i].type === PublicationType.Circuit) {
			savedFileData.splice(i, 0, 'no data');
		}
	}

	const likedJson =
		pageUserLikedResponses === null || pageUserLikedResponses.status === 204
			? { liked: [], likedFileData: [] }
			: await pageUserLikedResponses.json();
	// console.log(likedJson)
	const liked = likedJson.liked;
	const likedFileData = likedJson.likedFileData;


	for (let i = 0; i < liked.length; i++) {
		if (liked[i].type === PublicationType.Circuit) {
			likedFileData.splice(i, 0, 'no data');
		}
	}

	const savedByUser =
		mySavedResults.status === 204
			? { saved: [] }
			: await mySavedResults.json();
	const publications: ExtendedPublication[] = (await pubsRes.json()).publications;
	
	return {
		publications,
		saved,
		liked,
		savedFileData,
		likedByUser: likedByUser,
		used,
		savedByUser: savedByUser.saved,
	};
};

export type PublicationInfo = {
	publication: {
		tags: {
			content: string;
		}[];
		publisher: User & {
			profilePicData: string;
		};
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
