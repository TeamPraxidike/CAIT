import type { Actions } from './$types';
export const actions = {
	comment: async ({ request }) => {
		const data = await request.formData();
		console.log(data);
		console.log("KAFQV GUZEL: " + data.get("comment"));
	},
} satisfies Actions;
