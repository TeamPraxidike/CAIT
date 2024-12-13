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
import type { File as PrismaFile } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { verifyAuth } from '$lib/database/auth';

/**
 * Returns a user by id
 * @param params
 */
export async function GET({ params, locals }) {
	const authError = await verifyAuth(locals);
	if (authError) return authError;

	const { id } = params;
	try {
		const user = await getUserById(id);
		if (!user)
			return new Response(JSON.stringify({ error: 'User not found' }), {
				status: 404,
			});

		// profilePic return
		const profilePicData: FetchedFileItem = profilePicFetcher(
			user.profilePic,
		);

		return new Response(JSON.stringify({ user, profilePicData }), {
			status: 200,
		});
	} catch (error) {
		return new Response(JSON.stringify({ error }), { status: 500 });
	}
}


/**
 * Deletes a user by id
 * @param params
 */
export async function DELETE({ params, locals }) {
	const authError = await verifyAuth(locals);
	if (authError) return authError;

	const { id: userId } = params;

	try {
		const user = await prisma.$transaction(async (prismaTransaction: Prisma.TransactionClient) => {
			const user = await deleteUser(userId, prismaTransaction);

			// check if user has profilePic
			const profilePic: PrismaFile | null = user.profilePic;

			// remove if they do
			if (profilePic) {
				try {
					fileSystem.deleteFile(profilePic.path);
				} catch (errorFileSystem) {
					throw new Error('Error while deleting profile picture');
				}
			}

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
		return new Response(JSON.stringify({ error: 'Server Error' }), {
			status: 500,
		});
	}
}

/**
 * Edits a user by id
 * @param params
 * @param request
 */
export async function PUT({ params, request, locals }) {
	const authError = await verifyAuth(locals);
	if (authError) return authError;

	const body: UserForm = await request.json();
	try {
		const user = await prisma.$transaction(async (prismaTransaction: Prisma.TransactionClient) => {
			const userData: userEditData = {
				id: params.id,
				firstName: body.metaData.firstName,
				lastName: body.metaData.lastName,
				email: body.metaData.email,
				aboutMe: body.metaData.aboutMe,
			};

			const user = await editUser(userData, prismaTransaction);

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
