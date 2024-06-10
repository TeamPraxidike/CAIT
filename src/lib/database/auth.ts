import { CredentialsSignin, SvelteKitAuth } from '@auth/sveltekit';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from './prisma';
import { profilePicFetcher, updateProfilePic } from '$lib/database/file';
import Credentials from '@auth/core/providers/credentials';
import { createUser, getUserByEmail } from '$lib/database/user';
import type { User as PrismaUser } from '@prisma/client';
import { signInSchema } from '$lib/util/zod';
import { verifyPassword } from '$lib/util/auth';
import GitHub from '@auth/sveltekit/providers/github';
import {
	AUTH_GITHUB_ID,
	AUTH_GITHUB_SECRET,
	AUTH_SECRET,
} from '$env/static/private';
import type { AdapterUser } from '@auth/core/adapters';

function ModifiedPrismaAdapter(p: typeof prisma) {
	return {
		...PrismaAdapter(p),
		async createUser(user: Omit<AdapterUser, 'id'>) {
			const created = await createUser({
				email: user.email,
				password: user.password || '',
				firstName: user.firstName ?? user.name?.split(' ')[0] ?? '',
				lastName: user.lastName ?? user.name?.split(' ')[1] ?? '',
			});

			if (user.image)
				await updateProfilePic(
					{ type: 'link', info: user.image },
					created.id,
				);

			return created as AdapterUser;
		},
	};
}

const providers = [
	GitHub({
		clientId: AUTH_GITHUB_ID,
		clientSecret: AUTH_GITHUB_SECRET,
	}),
	Credentials({
		credentials: {
			email: { label: 'Email', type: 'email' },
			password: { label: 'Password', type: 'password' },
			firstName: { label: 'First Name', type: 'text' },
			lastName: { label: 'Last Name', type: 'text' },
		},
		authorize: async (credentials) => {
			const { email, password } =
				await signInSchema.parseAsync(credentials);

			// logic to verify if user exists
			const user = await getUserByEmail(email);

			if (!user) throw new CredentialsSignin('User not found');

			// User exists, verify password
			if (!verifyPassword(password, user.password))
				throw new CredentialsSignin('Invalid password');

			// return json object with the user data
			return user;
		},
	}),
];

export const { handle, signIn, signOut } = SvelteKitAuth({
	adapter: ModifiedPrismaAdapter(prisma),
	providers,
	session: {
		strategy: 'jwt',
	},
	pages: {
		signIn: '/signin',
	},
	trustHost: true,
	secret: AUTH_SECRET,
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.user = user as PrismaUser;
			}
			return token;
		},
		async session({ session, token }) {
			if (token.user) {
				session.user = token.user;

				const userAndPfp = await prisma.user.findUnique({
					where: { id: token.user.id },
					include: { profilePic: true },
				});

				if (!userAndPfp) throw new Error('User not found');
				session.userPfp = profilePicFetcher(userAndPfp.profilePic);
			}
			return session;
		},
	},
});

export const verifyAuth = async (locals: App.Locals) => {
	if (process.env.NODE_ENV === 'test') return null;

	const session = await locals.auth();
	if (!session || !session.user) return unauthResponse();

	return null;
};

// TODO: ALLOW MAINTAINERS AND ADMINS TO EDIT, RIGHT NOW EVERYONE CAN!
export const canEdit = async (locals: App.Locals, ownerId: string) => {
	if (process.env.NODE_ENV === 'test') return true;

	const session = await locals.auth();
	if (!session || !session.user) return false;

	return session.user.id === ownerId;
};

export const canRemove = async (locals: App.Locals, ownerId: string) => {
	if (process.env.NODE_ENV === 'test') return true;

	const session = await locals.auth();
	if (!session || !session.user) return false;

	if (session.user.isAdmin) return true;

	return session.user.id === ownerId;
};

export const unauthResponse = () => {
	return new Response(JSON.stringify({ error: 'Unauthorized' }), {
		status: 401,
	});
};
