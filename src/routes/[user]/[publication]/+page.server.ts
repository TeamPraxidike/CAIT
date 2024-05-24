import type { Actions } from './$types';
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
				userId: parseInt(data.get('userId')?.toString() || ''),
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
				userId: parseInt(data.get('userId')?.toString() || ''),
				commentId: parseInt(data.get('commentId')?.toString() || ''),
			};
			res = await fetch('/api/reply', {
				method: 'POST',
				body: JSON.stringify(reply),
			});
		}
		console.log(res);
		return { status: res.status };
	},
} satisfies Actions;
