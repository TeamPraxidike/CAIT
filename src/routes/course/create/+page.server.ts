import type { Actions } from './$types';
import { redirect } from '@sveltejs/kit';
import { Level } from '@prisma/client';
import { goto } from '$app/navigation';


export const actions = {
	publish: async ({ request, fetch, locals }) => {
		const session = await locals.safeGetSession();
		if (!session || !session.user) throw redirect(303, '/signin');
		try {
			const formData = await request.formData();
			const title = formData.get('title');
			const learningObjectives: string[] = JSON.parse(formData.get('learningObjectives') as string);
			const prerequisites = JSON.parse(formData.get('prerequisites') as string);
			const courseData = {
				learningObjectives: learningObjectives,
				prerequisites: prerequisites,
				educationalLevel: Level.Bachelor,
				courseName: title,
				creatorId: locals.session?.user.id,
			};
			const res = await fetch(`/api/course`, {
				method: 'POST',
				body: JSON.stringify(courseData),
			});
			const newCourse = await res.json();
			console.log(newCourse);
		} catch (error) {
			console.error("Error creating course ", error);
			throw redirect(303, '/course/create');
		}
		throw redirect(302, '/publish/materials');
	},

} satisfies Actions;
