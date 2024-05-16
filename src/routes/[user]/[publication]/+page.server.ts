import type { Actions } from './$types';
export const actions = {
	comment: async ({ request }) => {
		const data = await request.formData();
		console.log(1);
	},
	check: async (event) => {
		console.log(event);
	},
} satisfies Actions;
