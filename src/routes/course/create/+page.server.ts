import type { Actions } from './$types';
import { redirect } from '@sveltejs/kit';
import { Level } from '@prisma/client';


export const actions = {
	publish: async ({ request, fetch, locals }) => {
		const session = await locals.safeGetSession();
		if (!session || !session.user) throw redirect(303, '/signin');

		const formData = await request.formData();

		const title = formData.get('title');
		const learningObjectives = JSON.parse(formData.get('learningObjectives') as string);
		const prerequisites = JSON.parse(formData.get('prerequisites') as string);

		const courseData = {
			learningObjectives: learningObjectives,
			prerequisites: prerequisites,
			educationalLevel: Level.Bachelor,
			courseName: title,
			creatorId: locals.session?.user.id,
		};
		console.log(courseData);
		const res = await fetch(`/api/course`, {
			method: 'POST',
			body: JSON.stringify(courseData),
		});
		const newCourse = await res.json();
		// throw redirect(303, `/${newUser.username}`);
	},

} satisfies Actions;
