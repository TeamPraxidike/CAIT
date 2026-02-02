import type { Tag } from '@prisma/client';
import type { Actions, PageServerLoad } from './$types';
import { type CircuitForm, type FetchedFileArray } from '$lib/database';
import { env } from '$env/dynamic/public';

export const load: PageServerLoad = async ({ fetch, parent, locals }) => {
	await parent();
	const tags: Tag[] = await (await fetch('/api/tags')).json();
	const { users } = await (await fetch(`/api/user`)).json();
	let liked: number[] = [];
	let saved: { saved: number[]; savedFileData: FetchedFileArray } = {
		saved: [],
		savedFileData: [],
	};

	const session = await locals.safeGetSession();

	if (session && session.user) {
		const likedResponse = await fetch(`/api/user/${session.user.id}/liked`);
		liked = likedResponse.status === 200 ? await likedResponse.json() : [];

		const savedResponse = await fetch(
			`/api/user/${session.user.id}/saved?fullPublications=false`,
		);
		saved =
			savedResponse.status === 200
				? await savedResponse.json()
				: { saved: [], savedFileData: [] };
	}

	return { tags, users, liked: liked, saved: saved, PUBLIC_SUPABASE_URL: env.PUBLIC_SUPABASE_URL };
};

export const actions = {
	/**
	 * Publish a new circuit action.
	 * @param request the request object from the client, *provided by SvelteKit*
	 * @param fetch the fetch function to send requests to the server, *provided by SvelteKit*
	 */
	publish: async ({ request, fetch }) => {
		const data = await request.formData();

		console.log("Form data received:", data);

		const pid = data.get('userId')?.toString();
		const title = data.get('title')?.toString() || '';
		const description = data.get('description')?.toString() || '';
		const selectedTags = data.get('tags')?.toString() || '';
		//I need to get the separate strings here so I can create them as string[], but not sure how to do that
		const newTags = data.getAll('newTags') || '';

		const additionalMaintainers =
			data.get('maintainers')?.toString() || '';
		const prior = data.get('prerequisites')?.toString() || '';
		const LOs = data.get('learningObjectives')?.toString() || '';
		const isDraft = data.get('isDraft')?.toString() === 'true';

		//circuit data does not get carried over to the submission of the form, don't know why
		const circuitData = data.get('circuitData')?.toString() || '[]';


		const circuitCoverPic = data.get('coverPic')?.toString() || '{}';


		const newTagsJ = JSON.stringify(newTags);
		const outerArray = JSON.parse(newTagsJ);
		const newTagsArray: string[] = JSON.parse(outerArray[0]) || [];

		if (newTagsArray.length !== 0) {
			const resTags = await fetch('/api/tags', {
				method: 'POST',
				body: JSON.stringify({ tags: newTagsArray }),
			});
			if (resTags.status !== 200) {
				return {
					status: resTags.status,
					message: await resTags.json(),
				};
			}
		}

		if (pid === undefined) {
			throw new Error('User Id was undefined');
		}
		const circuit: CircuitForm = {
			userId: pid,
			metaData: {
				title: title,
				description: description,
				difficulty: 'easy',
				learningObjectives: JSON.parse(LOs),
				prerequisites: JSON.parse(prior),
				tags: JSON.parse(selectedTags),
				maintainers: JSON.parse(additionalMaintainers),
				isDraft: isDraft,
			},
			coverPic: JSON.parse(circuitCoverPic),
			nodeDiff: JSON.parse(circuitData),
		};
		const res = await fetch('/api/circuit', {
			method: 'POST',
			body: JSON.stringify(circuit),
		});
		return { status: res.status, id: (await res.json()).id };
	},
} satisfies Actions;
