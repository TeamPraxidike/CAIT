import type {Actions} from './$types'
export const actions = {
	publish: async ({ request, fetch }) => {
		const data = await request.formData();

		const material = {
			title: data.get('title'),
			description: data.get('description'),
		}

		await fetch('/api/material', {
			method: "POST",
			body: JSON.stringify(material),
		})
	},
} satisfies Actions;


