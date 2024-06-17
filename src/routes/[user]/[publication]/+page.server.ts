import type { Actions, PageServerLoad } from './$types';
import type { FetchedFileArray } from '$lib/database';

export const load: PageServerLoad = async ({
	parent,
	params,
	fetch,
	locals,
}) => {
	await parent();
	const session = await locals.auth();

	let liked: number[] = [];
	let saved: { saved: number[]; savedFileData: FetchedFileArray } = {
		saved: [],
		savedFileData: [],
	};
	let reported: boolean = false;

	if (session !== null) {
		const likedResponse = await fetch(`/api/user/${session.user.id}/liked`);
		liked = likedResponse.status === 200 ? await likedResponse.json() : [];

		const savedResponse = await fetch(
			`/api/user/${session.user.id}/saved?fullPublications=false`,
		);
		saved =
			savedResponse.status === 200
				? await savedResponse.json()
				: { saved: [], savedFileData: [] };

		const reportedResponse = await fetch(
			`/api/publication/${params.publication}/reported`,
		);
		reported = await reportedResponse.json();
	}
	const circuitRes = await fetch(`/api/circuit/${params.publication}/all`);
	const circuitsPubAppearIn = await circuitRes.json();

	const similarRes = await fetch(`/api/publication/${params.publication}/similar`);
	const similarPublications = await similarRes.json();

	return { circuitsPubAppearIn, similarPublications, liked, saved, reported };
};

export const actions = {
	comment: async ({ request, fetch }) => {
		const data = await request.formData();

		const isComment = JSON.parse(
			data.get('isComment')?.toString() || 'true',
		);
		let res: Response;

		if (isComment) {
			const comment = {
				content: data.get('comment'),
				userId: data.get('userId')?.toString() || '',
				publicationId: parseInt(
					data.get('publicationId')?.toString() || '',
				),
			};
			res = await fetch('/api/comment', {
				method: 'POST',
				body: JSON.stringify(comment),
			});
		} else {
			const reply = {
				content: data.get('comment'),
				userId: data.get('userId')?.toString() || '',
				commentId: parseInt(data.get('commentId')?.toString() || ''),
			};
			res = await fetch('/api/reply', {
				method: 'POST',
				body: JSON.stringify(reply),
			});
		}
		const content = await res.json();
		return { status: res.status, content: content };
	},
} satisfies Actions;
