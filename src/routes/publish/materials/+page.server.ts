import type {Actions} from './$types'

export const actions = {
	publish: async ({ request, fetch }) => {
		const data = await request.formData();

		const material = {
			userId: Number(data.get('userId')?.toString()),
			title: data.get('title')?.toString(),
			description: data.get('description')?.toString(),
			copyright: Boolean(data.get('copyright')),
			difficulty: 'easy',
			timeEstimate: Number(data.get('estimate')?.toString()),
			theoryPractice: 34,
			paths: [''],
			titles: [''],
		}

		const res = await fetch('/api/material', {
			method: "POST",
			body: JSON.stringify(material),
		})

		console.log("res", res.status, await res.json());

		return {status: res.status}
	},
} satisfies Actions;


