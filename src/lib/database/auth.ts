export const verifyAuth = async (locals: App.Locals) => {
	return null;
};

// TODO: ALLOW MAINTAINERS AND ADMINS TO EDIT, RIGHT NOW EVERYONE CAN!
export const canEdit = async (locals: App.Locals, ownerId: string) => {
	return true;
	// if (process.env.NODE_ENV === 'test') return true;
	//
	// const session = await locals.auth();
	// if (!session || !session.user) return false;
	//
	// return session.user.id === ownerId;
};

export const canRemove = async (locals: App.Locals, ownerId: string) => {
	return true;
	// if (process.env.NODE_ENV === 'test') return true;
	//
	// const session = await locals.auth();
	// if (!session || !session.user) return false;
	//
	// if (session.user.isAdmin) return true;
	//
	// return session.user.id === ownerId;
};

export const unauthResponse = () => {
	return new Response(JSON.stringify({ error: 'Unauthorized' }), {
		status: 401,
	});
};
