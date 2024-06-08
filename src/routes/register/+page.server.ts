import type { PageServerLoad, Actions } from './$types';
import { redirect } from '@sveltejs/kit';
import { signOnSchema } from '$lib/util/zod';
import type { UserCreateForm } from '$lib/database';
import { hashPassword } from '$lib/util/auth';

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth();
	if (session?.user) throw redirect(303, '/browse');
	return { session };
};

export const actions = {
	register: async ({ request, fetch }) => {
		const formData = await request.formData();
		const formDataObj = Object.fromEntries(formData.entries());

		const { success, error } =
			await signOnSchema.safeParseAsync(formDataObj);

		if (!success) {
			return {
				status: 400,
				message: 'Bad input',
				error: error.errors,
			};
		}

		const sent: UserCreateForm = {
			metaData: {
				firstName: formDataObj.firstName.toString(),
				lastName: formDataObj.lastName.toString(),
				email: formDataObj.email.toString(),
				password: hashPassword(formDataObj.password.toString()),
			},
		};

		const res = await fetch('/api/user', {
			method: 'POST',
			body: JSON.stringify(sent),
			headers: {
				'Content-Type': 'application/json',
			},
		});

		if (!res.ok) return { status: res.status, message: res.statusText };

		return { status: 200, message: 'success' };
	},
} satisfies Actions;
