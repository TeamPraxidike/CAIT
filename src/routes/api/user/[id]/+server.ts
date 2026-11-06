import {
	deleteUser,
	editUser,
	type FetchedFileItem,
	fileSystem,
	getUserById,
	prisma,
	type userEditData,
	type UserForm,
} from '$lib/database';
import { profilePicFetcher, updateProfilePic } from '$lib/database/file';
import { Prisma, UserRole } from '@prisma/client';
import { canEditOrRemove, getEmailViewer, unauthResponse, verifyAuth } from '$lib/database/auth';
import { redactEmail } from '$lib/util/emailVisibility';
import { isAdmin, type User, type TUserWithPostsAndProfilePic, type TUserWithProfilePic } from '$lib/database/user';


export type TGETuser = {user: TUserWithPostsAndProfilePic, profilePicData: FetchedFileItem};
/**
 * Returns a user by id
 * @param params
 * @param locals
 */
export async function GET({ params, locals }) {
	const authError = await verifyAuth(locals);
	if (authError !== null) return authError;

	const { id } = params;
	try {
		const user:TUserWithPostsAndProfilePic = await getUserById(id);
		if (user === null) {
			return new Response(JSON.stringify({ error: 'User not found' }), {
				status: 404,
			});
		}

		const viewer = await getEmailViewer(locals);
		const sanitizedUser = redactEmail(user, viewer);

		// profilePic return
		const profilePicData:FetchedFileItem = await profilePicFetcher(
			user.profilePic,
		);

		return new Response(JSON.stringify({ user: sanitizedUser, profilePicData }), {
			status: 200,
		});
	} catch (error) {
		return new Response(JSON.stringify({ error }), { status: 500 });
	}
}

/**
 * Deletes a user by id
 * @param params
 * @param locals
 */
export async function DELETE({ params, locals }) {
	const { id: userId } = params;

	if (!(await canEditOrRemove(locals, userId, []))) {
		return unauthResponse();
	}

	try {
		const existingUser = await prisma.user.findUnique({
			where: { id: userId },
			select: {
				id: true,
				isAdmin: true,
				role: true,
				profilePic: { select: { path: true } },
				posts: {
					select: {
						coverPic: { select: { path: true } },
						materials: { select: { files: { select: { path: true } } } },
					},
				},
			},
		});
		if (!existingUser) {
			return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
		}

		if (process.env.NODE_ENV !== 'test') {
			const session = await locals.safeGetSession();
			const actorId = String(session?.user?.id ?? '');
			const targetIsPrivileged = existingUser.isAdmin ||
				existingUser.role === UserRole.MODERATOR ||
				existingUser.role === UserRole.ADMIN;
			if (actorId !== userId && targetIsPrivileged && !(await isAdmin(actorId))) {
				return unauthResponse();
			}
		}

		const targetIsAdmin = existingUser.isAdmin || existingUser.role === UserRole.ADMIN;
		if (targetIsAdmin) {
			const adminCount = await prisma.user.count({
				where: { OR: [{ role: UserRole.ADMIN }, { isAdmin: true }] },
			});
			if (adminCount <= 1) {
				return new Response(JSON.stringify({ error: 'The last administrator cannot be deleted' }), {
					status: 409,
				});
			}
		}

		// Use a single deletion path. The on_auth_user_deleted_jic database
		// trigger removes the corresponding auth.users row after this delete.
		const filePaths = new Set<string>();
		if (existingUser.profilePic) filePaths.add(existingUser.profilePic.path);
		for (const publication of existingUser.posts) {
			if (publication.coverPic) filePaths.add(publication.coverPic.path);
			for (const file of publication.materials?.files ?? []) filePaths.add(file.path);
		}

		const user: TUserWithProfilePic = await prisma.$transaction(async (prismaTransaction: Prisma.TransactionClient) => {
			const user: TUserWithProfilePic = await deleteUser(userId, prismaTransaction);
			if(!user) {
				throw "User not found";
			}
			return user;
		});

		for (const filePath of filePaths) {
			try {
				await fileSystem.deleteFile(filePath);
			} catch (fileError) {
				console.error(`User file cleanup failed for ${filePath}:`, fileError);
			}
		}

		return new Response(JSON.stringify(user), { status: 200 });
	} catch (error:any) {
		if (
			error == "User not found" || error.code == "P2025"
		) {
			return new Response(JSON.stringify({ error: 'User not found' }), {
				status: 404,
			});
		}
		return new Response(JSON.stringify({ error: 'Server Error' }), {
			status: 500,
		});
	}
}

/**
 * Edits a user by id
 * @param params
 * @param request
 * @param locals
 */
export async function PUT({ params, request, locals }) {
	const authError = await verifyAuth(locals, params.id);
	if (authError) return authError;

	const body: UserForm = await request.json();
	try {
		const user: User = await prisma.$transaction(async (prismaTransaction: Prisma.TransactionClient) => {
			const userData: userEditData = {
				id: params.id,
				firstName: body.metaData.firstName,
				lastName: body.metaData.lastName,
				email: body.metaData.email,
				aboutMe: body.metaData.aboutMe,
			};

			const user: User = await editUser(userData, prismaTransaction);

			await updateProfilePic(body.profilePic, user.id, prismaTransaction);

			return user;
		});

		return new Response(JSON.stringify(user), { status: 200 });
	} catch (error) {
		// TODO: documentation on this is atrocious, verify with tests!!!
		if (
			error instanceof Prisma.PrismaClientKnownRequestError &&
			error.code === 'P2025'
		) {
			return new Response(JSON.stringify({ error: 'User not found' }), {
				status: 404,
			});
		}
		return new Response(JSON.stringify({ error }), { status: 500 });
	}
}
