import { prisma } from '$lib/database/prisma';
import { unauthResponse } from '$lib/database/auth';
import { isAdmin } from '$lib/database/user';
import { UserRole } from '@prisma/client';

const USER_ROLES = new Set<UserRole>(Object.values(UserRole));

export async function PATCH({ params, request, locals }) {
	const session = await locals.safeGetSession();
	const actorId = String(session?.user?.id ?? '');
	if (!actorId || !(await isAdmin(actorId))) return unauthResponse();

	let requestedRole: unknown;
	try {
		requestedRole = (await request.json()).role;
	} catch {
		return new Response(JSON.stringify({ error: 'Malformed request' }), { status: 400 });
	}

	if (typeof requestedRole !== 'string' || !USER_ROLES.has(requestedRole as UserRole)) {
		return new Response(JSON.stringify({ error: 'Invalid user role' }), { status: 400 });
	}

	const role = requestedRole as UserRole;
	const existingUser = await prisma.user.findUnique({
		where: { id: params.id },
		select: { id: true, role: true, isAdmin: true },
	});
	if (!existingUser) {
		return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
	}

	const isCurrentlyAdmin = existingUser.isAdmin || existingUser.role === UserRole.ADMIN;
	if (isCurrentlyAdmin && role !== UserRole.ADMIN) {
		const adminCount = await prisma.user.count({
			where: { OR: [{ role: UserRole.ADMIN }, { isAdmin: true }] },
		});
		if (adminCount <= 1) {
			return new Response(JSON.stringify({ error: 'The last administrator cannot be demoted' }), {
				status: 409,
			});
		}
	}

	const updatedUser = await prisma.user.update({
		where: { id: params.id },
		data: {
			role,
			// Keep the legacy field synchronized until its removal migration.
			isAdmin: role === UserRole.ADMIN,
		},
		select: { id: true, role: true, isAdmin: true },
	});

	return new Response(JSON.stringify(updatedUser), { status: 200 });
}
