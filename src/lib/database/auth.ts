import { CredentialsSignin, SvelteKitAuth } from '@auth/sveltekit';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from './prisma';
import { profilePicFetcher } from '$lib/database/file';
import Credentials from '@auth/core/providers/credentials';
import { createUser, getUserByEmail } from '$lib/database/user';
import type { User as PrismaUser } from '@prisma/client';
import { signInSchema } from '$lib/util/zod';
import { verifyPassword } from '$lib/util/auth';
import GitHub from '@auth/sveltekit/providers/github';
import { AUTH_GITHUB_ID, AUTH_GITHUB_SECRET } from '$env/static/private';
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
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.user = user as PrismaUser & {
					profilePicData: string;
				};
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

				if (userAndPfp) {
					const profilePic = profilePicFetcher(userAndPfp.profilePic);
					session.user.profilePicData = profilePic.data;
				}
			}
			return session;
		},
	},
});
