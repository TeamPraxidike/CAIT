import { SvelteKitAuth } from '@auth/sveltekit';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from './prisma';
import { profilePicFetcher } from '$lib/database/file';
import Credentials from '@auth/core/providers/credentials';
import { createUser, getUserByEmail } from '$lib/database/user';
import type { User as PrismaUser } from '@prisma/client';
import crypto from 'crypto';

// TODO: PROTECT AGAINST RAINBOW TABLES ATTACK BY USING SALTS
async function hashPassword(password: string) {
	return crypto.createHash('sha512').update(password).digest('hex');
}

async function verifyPassword(password: string, hashedPassword: string) {
	const hash = crypto.createHash('sha512').update(password).digest('hex');
	return hash === hashedPassword;
}

const providers = [
	Credentials({
		credentials: {
			email: { label: 'Email', type: 'email' },
			password: { label: 'Password', type: 'password' },
			firstName: { label: 'First Name', type: 'text' },
			lastName: { label: 'Last Name', type: 'text' },
		},
		authorize: async (credentials) => {
			if (!credentials?.email || !credentials?.password) {
				throw new Error('Missing email or password');
			}

			const password = credentials.password as string;
			const email = credentials.email as string;

			// logic to verify if user exists
			let user = await getUserByEmail(email);

			if (user) {
				// User exists, verify password
				const isValid = await verifyPassword(password, user.password);
				if (!isValid) {
					throw new Error('Invalid password');
				}
			} else {
				// User does not exist, create new user
				const hashedPassword = await hashPassword(password);
				user = await createUser({
					email: credentials.email as string,
					firstName: credentials.firstName as string,
					lastName: credentials.lastName as string,
					password: hashedPassword,
				});
			}

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
		signIn: '/login', // Define your custom sign-in page here
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
