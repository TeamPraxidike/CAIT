import type { DefaultSession, DefaultUser } from '@auth/core/types';
import type { User as PrismaUser } from '@prisma/client';

declare module '@auth/core/types' {
	interface Session {
		user: PrismaUser & {
			profilePicData: string;
		} & DefaultSession['user'];
	}

	interface User extends PrismaUser, DefaultUser {
		id: string;
		profilePicData: string;
	}
}

declare module '@auth/core/jwt' {
	interface JWT {
		user: PrismaUser & {
			profilePicData: string;
		};
	}
}
