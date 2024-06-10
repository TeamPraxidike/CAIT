import type { UserForm } from '$lib/database';
import type { Actions } from './$types';

export const actions = {
	edit: async ({ request, fetch }) => {
		const formData = await request.formData();

		const id = formData.get('userId');
		const firstName = formData.get('firstName')?.toString();
		const lastName = formData.get('lastName')?.toString();
		const email = formData.get('email')?.toString();
		const aboutMe = formData.get('aboutMe')?.toString();

		if (!id || !firstName || !lastName || !email || !aboutMe)
			return {
				status: 400,
				message:
					'Missing required fields:' + ' ' + !id
						? 'id'
						: '' + !firstName
							? 'firstName'
							: '' + !lastName
								? 'lastName'
								: '' + !email
									? 'email'
									: '',
			};

		const profilePicFile = formData.get('profilePic');
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

		return { status: res.status, id: (await res.json()).id };
	},
} satisfies Actions;
