import { isAdmin } from '$lib/database/user';

export const verifyAuth = async (locals: App.Locals) => {
	if (process.env.NODE_ENV === 'test') return null;

	const session = await locals.safeGetSession();
	if (!session || !session.user) return unauthResponse();

	return null;
};

// TODO: Either make operation ENUM or change logic

/**
 * Allow owner, maintainers and admins to edit
 * @param locals
 * @param ownerId
 * @param maintainerIds
 * @param operation - EDIT or REMOVE
 */
export const canEditOrRemove = async (locals: App.Locals, ownerId: string,
									  maintainerIds: string[], operation: string) => {
	if (process.env.NODE_ENV === 'test') return true;

	const session = await locals.safeGetSession();
	if (!session || !session.user) return false;

	// Admins can remove but cannot edit
	if (operation === "EDIT") {
		return (String(session.user.id) === ownerId) ||
			(maintainerIds.includes(String(session.user.id)));
	}
	else if (operation === "REMOVE") {
		return (String(session.user.id) === ownerId) ||
			(maintainerIds.includes(String(session.user.id))) ||
			isAdmin(String(session.user.id));
	}
	else return false;
};

// /**
//  * Allow owner, maintainers and admins to remove
//  * @param locals
//  * @param ownerId
//  * @param maintainerIds
//  */
// export const canRemove = async (locals: App.Locals, ownerId: string, maintainerIds: string[]) => {
// 	if (process.env.NODE_ENV === 'test') return true;
//
// 	const session = await locals.safeGetSession();
// 	if (!session || !session.user) return false;
//
// 	return (String(session.user.id) === ownerId) ||
// 		(maintainerIds.includes(String(session.user.id))) ||
// 		isAdmin(String(session.user.id));
// };

export const unauthResponse = () => {
	return new Response(JSON.stringify({ error: 'Unauthorized' }), {
		status: 401,
	});
};
