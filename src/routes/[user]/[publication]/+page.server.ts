import type { Actions } from './$types';
export const actions = {
	comment: async ({ request }) => {
		const data = await request.formData();
		console.log('COMMENT' + data.get('comment'));
	},
} satisfies Actions;
