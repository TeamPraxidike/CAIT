import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	await parent();
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
			console.log(reply);
			res = await fetch('/api/reply', {
				method: 'POST',
				body: JSON.stringify(reply),
			});
		}
		const content = await res.json();
		return { status: res.status, content: content };
	},
} satisfies Actions;
