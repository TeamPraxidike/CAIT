import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import type { User } from '@prisma/client';
import { PublicationType } from '@prisma/client';
import type { CourseWithMaintainersAndProfilePic } from '$lib/database/courses';
// import type { ExtendedPublication } from '../api/course/+server';

export const load: PageServerLoad = async ({
	params,
	fetch,
	parent,
	locals,
}) => {
	const layoutData = await parent();

	const session = await locals.safeGetSession();
	if (!session || !session.user) throw redirect(303, '/signin');

	const pubsRes = await fetch(`/api/course-extended`);

	if (pubsRes.status !== 200) {
		return {
			status: pubsRes.status,
			error: pubsRes.statusText,
		};
	}
	
	// todo: remove the ID filter here and do that on the internal end of the server
	const coursename = params.course;

	const courses: CourseWithMaintainersAndProfilePic[] = (await pubsRes.json());
	
	return {
		course: courses.find(c => c.courseName === coursename)
	}

	// // Check if the user is viewing their own profile and return his saved publications
	// let savedRes = null;
	// if (session.user.id === layoutData.user.id) {
	// 	savedRes = await fetch(
	// 		`/api/user/${session.user.id}/saved?fullPublications=true`,
	// 	);
	// 	if (![200, 204].includes(savedRes.status)) {
	// 		throw new Error('Failed to fetch saved materials');
	// 	}
	// }

	// // If the user is viewing another user's profile, fetch saved publications of that user so that they can be marked
	// const savedByUserRes = await fetch(
	// 	`/api/user/${session.user.id}/saved?fullPublications=false`,
	// );
	// if (![200, 204].includes(savedByUserRes.status)) {
	// 	throw new Error('Failed to fetch saved by user materials');
	// }

	// const likedResponse = await fetch(`/api/user/${session.user.id}/liked`);
	// const liked =
	// 	likedResponse.status === 200 ? await likedResponse.json() : [];

	// const usedResponse = await fetch(
	// 	`/api/user/${session.user.id}/use-in-course`,
	// );
	// const used = usedResponse.status === 200 ? await usedResponse.json() : [];

	// const savedJson =
	// 	savedRes === null || savedRes.status === 204
	// 		? { saved: [], savedFileData: [] }
	// 		: await savedRes.json();
	// const saved = savedJson.saved;
	// const savedFileData = savedJson.savedFileData;


	// for (let i = 0; i < saved.length; i++) {
	// 	if (saved[i].type === PublicationType.Circuit) {
	// 		savedFileData.splice(i, 0, 'no data');
	// 	}
	// }

	// const savedByUser =
	// 	savedByUserRes.status === 204
	// 		? { saved: [] }
	// 		: await savedByUserRes.json();
	// const publications: ExtendedPublication[] = (await pubsRes.json()).publications;
	
	// return {
	// 	publications,
	// 	saved,
	// 	savedFileData,
	// 	liked,
	// 	used,
	// 	savedByUser: savedByUser.saved,
	// };
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
