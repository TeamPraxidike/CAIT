import type { UserForm } from '$lib/database';
import type { Actions } from './$types';
import { redirect } from '@sveltejs/kit';

export const actions = {
	edit: async ({ request, fetch, locals }) => {
		const session = await locals.auth();
		if (!session) throw redirect(303, '/signin');

		const formData = await request.formData();

		const id = formData.get('userId');
		const firstName = formData.get('firstName')?.toString();
		const lastName = formData.get('lastName')?.toString();
		const aboutMe = formData.get('aboutMe')?.toString() || '';
		const email = formData.get('email')?.toString() || '';

		if (!id || !firstName || !lastName)
			return {
				status: 400,
				message:
					'Missing required fields:' + ' ' + !id
						? 'id'
						: '' + !firstName
							? 'firstName'
							: '' + !lastName
								? 'lastName'
								: '',
			};

		const profilePicFile = formData.get('profilePicSet');
		let profilePic = null;

		if (profilePicFile instanceof File) {
			const buffer = await profilePicFile.arrayBuffer();
			const info = Buffer.from(buffer).toString('base64');
			profilePic = {
				type: profilePicFile.type,
				info,
			};
		}

		const user: UserForm = {
			metaData: {
				firstName,
				lastName,
				email,
				aboutMe,
			},
			profilePic,
		};

		const res = await fetch(`/api/user/${id}`, {
			method: 'PUT',
			body: JSON.stringify(user),
		});
		const newUser = await res.json();
		session.user = newUser;

		return { status: res.status, id: newUser.id };
	},
} satisfies Actions;
