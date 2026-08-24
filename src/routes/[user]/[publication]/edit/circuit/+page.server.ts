import type { Actions, PageServerLoad } from './$types';
import {
	type CircuitForm,
} from '$lib/database';
import type { Tag } from '@prisma/client';
import { env } from '$env/dynamic/public';
import { loadCircuitData } from '$lib/util/frontendTypes.ts';
import { prisma } from '$lib/database/prisma';

export const load: PageServerLoad = async ({ fetch, parent, locals }) => {
	await parent();
	const tags: Tag[] = await (await fetch('/api/tags')).json();
	const { users } = await (await fetch(`/api/user`)).json();
	const res = await loadCircuitData(locals, fetch);
	return { tags, users, liked: res.liked, saved: res.saved, PUBLIC_SUPABASE_URL: env.PUBLIC_SUPABASE_URL };
};

export const actions = {
	edit: async ({ request, fetch, params }) => {
		const data = await request.formData();

		const userId = data.get('userId')?.toString() || '';

		const title = data.get('title')?.toString() || '';
		const description = data.get('description')?.toString() || '';
		const selectedTags = data.get('tags')?.toString() || '';
		const isDraft = data.get('isDraft')?.toString()  === 'true';

		//I need to get the separate strings here so I can create them as string[], but not sure how to do that
		const newTags = data.getAll('newTags') || '';

		const maintainers = data.get('maintainers')?.toString() || '';

		// Read field names matching what PublishWorkflow sends
		const LOs = String(data.get('learningObjectives') ?? '[]');
		const prior = String(data.get('prerequisites') ?? '[]');

		const circuitData = data.get('circuitData')?.toString();
		if (!circuitData) {
			return { status: 400, message: 'Missing circuit data', context: 'publication-form' };
		}

		const circuitCoverPic = data.get('coverPic')?.toString() || 'null';

		const newTagsS = JSON.stringify(newTags);
		const outerArray = JSON.parse(newTagsS);
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
		if (userId === undefined) {
			throw new Error('User Id was undefined');
		}

		// Fetch the circuit to get circuitId and publisherId from the database
		const circuitRes = await fetch(`/api/circuit/${params.publication}`);
		if (circuitRes.status !== 200) {
			return { status: circuitRes.status, message: 'Failed to fetch circuit data' };
		}
		const circuitInfo = await circuitRes.json();
		const circuitId = circuitInfo.id;
		const publisherId = circuitInfo.publication?.publisherId || '';
		const existingPublication = await prisma.publication.findUnique({
			where: { id: Number(params.publication) },
			select: { difficulty: true },
		});
		if (!existingPublication) {
			return { status: 404, message: 'Circuit not found', context: 'publication-form' };
		}

		const circuit: CircuitForm & { circuitId: number, publisherId: string } = {
			circuitId: circuitId,
			publisherId: publisherId,
			userId: userId,
			metaData: {
				title: title,
				description: description,
				difficulty: existingPublication.difficulty,
				learningObjectives: JSON.parse(LOs),
				prerequisites: JSON.parse(prior),
				tags: JSON.parse(selectedTags),
				maintainers: JSON.parse(maintainers),
				isDraft: isDraft,
			},
			coverPic: JSON.parse(circuitCoverPic),
			nodeDiff: JSON.parse(circuitData),
		};

		const res = await fetch(`/api/circuit/${params.publication}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(circuit),
		});

		const id = (await res.json()).id;
		return {
			status: res.status,
			id: id,
			context: 'publication-form'
		};
	}
} satisfies Actions;
