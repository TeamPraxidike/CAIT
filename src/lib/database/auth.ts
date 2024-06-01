import { CredentialsSignin, SvelteKitAuth } from '@auth/sveltekit';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from './prisma';
import { profilePicFetcher } from '$lib/database/file';
import Credentials from '@auth/core/providers/credentials';
import { getUserByEmail } from '$lib/database/user';
import type { User as PrismaUser } from '@prisma/client';
import { signInSchema } from '$lib/util/zod';
import { verifyPassword } from '$lib/util/auth';

const providers = [
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
	adapter: PrismaAdapter(prisma),
	providers,
	session: {
		strategy: 'jwt',
	},
	pages: {
		signIn: '/login',
	},
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.user = user as PrismaUser & { profilePicData: string };
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
