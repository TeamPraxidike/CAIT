import type { UserForm } from '$lib/database';
import type { Actions } from './$types';
import { redirect } from '@sveltejs/kit';


export const actions = {
	edit: async ({ request, fetch, locals }) => {
		const session = await locals.safeGetSession();
		if (!session || !session.user) throw redirect(303, '/signin');

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

		// throw redirect(303, `/${newUser.username}`);
		// return { status: res.status, id: newUser.id, username: newUser.username};
		throw redirect(303, `/${newUser.username}`);
	},

} satisfies Actions;
