import { verifyAuth } from '$lib/database/auth';
import { editUser, getUserById, type userEditData } from '$lib/database';

/**
 * A method used just to update the username of the user. It reuses the
 * edit function, but it does not change anything except of the username,
 * assuming the names have changed without going trough prisma, which
 * supabase sometimes does
 *
 * @param params id of the user
 * @param locals
 * @constructor
 */
export async function PUT({ params, locals }) {
	const authError = await verifyAuth(locals, params.id);
	if (authError) return authError;

	try {
		const user = await getUserById(params.id);

		if (!user) {
			return new Response(JSON.stringify('User not found'), { status: 404 });
		}

		const userData: userEditData = {
			id: params.id,
			firstName: user.firstName,
			lastName: user.lastName,
			email: user.email,
			aboutMe: user.aboutMe,
		};

		await editUser(userData);

		return new Response(JSON.stringify(user), { status: 200 });
	} catch (error) {
		return new Response(JSON.stringify({ error }), { status: 500 });
	}
}