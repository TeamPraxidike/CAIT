import { canModerate, isAdmin } from '$lib/database/user';
import type { EmailViewer } from '$lib/util/emailVisibility';

export const getEmailViewer = async (locals: App.Locals): Promise<EmailViewer> => {
	const userId = locals.user?.id ?? null;
	return {
		id: userId,
		isAdmin: userId ? await isAdmin(userId) : false,
	};
};

export const verifyAuth = async (locals: App.Locals, userId?: string) => {
	if (process.env.NODE_ENV === 'test') return null;

	const session = await locals.safeGetSession();
	if (!session || !session.user) return unauthResponse();

	if (await isAdmin(String(session.user.id)))
		return null;

	if (userId !== undefined && userId != session.user.id) return unauthResponse();
	return null;
};

/**
 * Allow owners, maintainers, moderators and admins to edit or remove content.
 * @param locals
 * @param ownerId
 * @param maintainerIds
 */
export const canEditOrRemove = async (locals: App.Locals, ownerId: string,
									  maintainerIds: string[]) => {
	if (process.env.NODE_ENV === 'test') return true;

	const session = await locals.safeGetSession();
	if (!session || !session.user) return false;

	const userId = String(session.user.id);
	return userId === ownerId ||
		maintainerIds.includes(userId) ||
		await canModerate(userId);
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
