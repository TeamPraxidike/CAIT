import type { Tag } from '@prisma/client';
import type { Actions, PageServerLoad } from './$types';
import type { CircuitForm } from '$lib/database';

export const load: PageServerLoad = async ({ fetch }) => {
	const tags: Tag[] = await (await fetch('/api/tags')).json();
	const users = await (await fetch(`/api/user`)).json();
	return { tags, users };
};

export const actions = {
	/**
	 * Publish a new circuit action.
	 * @param request the request object from the client, *provided by SvelteKit*
	 * @param fetch the fetch function to send requests to the server, *provided by SvelteKit*
	 */
	publish: async ({ request, fetch }) => {
		console.log('A');
		const data = await request.formData();
		const pid = data.get('publisherId')?.toString();
		const title = data.get('title')?.toString() || '';
		const description = data.get('description')?.toString() || '';
		const selectedTags = data.get('selectedTags')?.toString() || '';

		console.log('B');

		//I need to get the separate strings here so I can create them as string[], but not sure how to do that
		const newTags = data.getAll('newTags') || '';

		const additionalMaintainers =
			data.get('additionalMaintainers')?.toString() || '';
		const prior = data.get('prior')?.toString() || '';
		const LOs = data.get('learningObjectives')?.toString() || '';

		//circuit data does not get carried over to the submission of the form, don't know why
		const circuitData = data.get('circuitData')?.toString() || '';

		const circuitCoverPic = data.get('coverPic')?.toString() || '';

		const newTagsJ = JSON.stringify(newTags);
		const outerArray = JSON.parse(newTagsJ);
		const newTagsArray = JSON.parse(outerArray[0]) || [];

		console.log('C');
		console.log(newTagsArray);
		for (const tag of newTagsArray) {
			const res = await fetch('/api/tags', {
				method: 'POST',
				body: JSON.stringify({ content: tag }),
			});
			if (res.status !== 200) {
				return { status: 500, message: 'Tag Failed' };
			}
		}

		console.log('D');
		console.log(circuitCoverPic);
		const circuit: CircuitForm = {
			userId: Number(pid),
			metaData: {
				title: title,
				description: description,
				difficulty: 'easy',
				learningObjectives: JSON.parse(LOs),
				prerequisites: JSON.parse(prior),
				tags: JSON.parse(selectedTags),
				maintainers: JSON.parse(additionalMaintainers),
			},
			coverPic: JSON.parse(circuitCoverPic),
			nodeDiff: JSON.parse(circuitData),
		};
		console.log('E');
		const res = await fetch('/api/circuit', {
			method: 'POST',
			body: JSON.stringify(circuit),
		});
		return { status: res.status, id: (await res.json()).id };
	},
} satisfies Actions;
