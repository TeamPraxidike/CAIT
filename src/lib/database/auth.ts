export const verifyAuth = async (locals: App.Locals) => {
	if (process.env.NODE_ENV === 'test') return null;

	const session = await locals.safeGetSession();
	if (!session || !session.user) return unauthResponse();

	return null;
};

// TODO: ALLOW MAINTAINERS TO EDIT
export const canEdit = async (locals: App.Locals, ownerId: string) => {
	if (process.env.NODE_ENV === 'test') return true;

	const session = await locals.safeGetSession();
	if (!session || !session.user) return false;

	return session.user.id === ownerId;
};

export const canRemove = async (locals: App.Locals, ownerId: string) => {
	if (process.env.NODE_ENV === 'test') return true;

	const session = await locals.safeGetSession();
	if (!session || !session.user) return false;

	// TODO:
	// supabase check if admin
	// if (session.user.role) return true;

	return session.user.id === ownerId;
};

export const unauthResponse = () => {
	return new Response(JSON.stringify({ error: 'Unauthorized' }), {
		status: 401,
	});
};
