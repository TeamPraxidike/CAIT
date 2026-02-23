import type { Actions, PageServerLoad } from './$types';
import type { FetchedFileArray } from '$lib/database';

export const load: PageServerLoad = async ({
	parent,
	params,
	fetch,
	locals,
}) => {
	await parent();
	const session = await locals.safeGetSession();

	let liked: number[] = [];
	let saved: { saved: number[]; savedFileData: FetchedFileArray } = {
		saved: [],
		savedFileData: [],
	};
	let reported: boolean = false;

	// TODO: review this if statement -> does it need to encapsulate the methods below it too?
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

		const reportedResponse = await fetch(
			`/api/publication/${params.publication}/reported`,
		);
		reported = await reportedResponse.json();
	}

	async function getCircuitsThatContainPub() {
		try {
			// Gets circuits that contain the current publication
			// Todo: change hideous api path -> what does "all" mean??
			const circuitRes = await fetch(
				`/api/circuit/${params.publication}/all`,
			);
			if (!circuitRes.ok && circuitRes.status === 404) {
				return null;
			} else if (!circuitRes.ok) {
				// something definitely went wrong here
				throw new Error(
					`Failed to load files: ${circuitRes.statusText}`,
				);
			}
			return await circuitRes.json();
		} catch (err) {
			console.error(
				'Error while circuits that contain pub, page.server:\n',
				err,
			);
		}
	}

	async function getSimilar() {
		try {
			// Gets similar publications
			const similarRes = await fetch(
				`/api/publication/${params.publication}/similar`,
			);

			if (!similarRes.ok && similarRes.status === 404) {
				return null;
			} else if (!similarRes.ok) {
				// something definitely went wrong here
				throw new Error(
					`Failed to get similar publications: ${similarRes.statusText}`,
				);
			}
			return await similarRes.json();
		} catch (err) {
			console.error(
				'Error while circuits that contain pub, page.server:\n',
				err,
			);
		}
	}

	async function getHistory() {
		try {
			const historyRes = await fetch(
				`/api/publication/${params.publication}/history`,
			);
			if (!historyRes.ok) {
				console.error(
					'Failed to fetch history:',
					historyRes.statusText,
				);
				return [];
			}
			return await historyRes.json();
		} catch (err) {
			console.error('Error fetching history:', err);
			return [];
		}
	}

	return {
		circuitsPubAppearIn: getCircuitsThatContainPub(),
		similarPublications: getSimilar(),
		liked: liked,
		saved: saved,
		reported: reported,
		history: getHistory(),
	};
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
