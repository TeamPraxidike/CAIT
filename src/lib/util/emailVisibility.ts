import type { EmailVisibility } from '@prisma/client';

export const EMAIL_VISIBILITY_VALUES = ['HIDDEN', 'PUBLIC'] as const;

export function isEmailVisibility(value: unknown): value is EmailVisibility {
	return typeof value === 'string' && (EMAIL_VISIBILITY_VALUES as readonly string[]).includes(value);
}

export type EmailViewer = {
	id?: string | null;
	isAdmin?: boolean;
};

type EmailTarget = {
	id: string;
	emailVisibility?: EmailVisibility | null;
} | null | undefined;

export function canViewEmail(target: EmailTarget, viewer: EmailViewer): boolean {
	if (!target) return false;
	if (viewer.id && target.id && viewer.id === target.id) return true;
	if (viewer.isAdmin) return true;
	return target.emailVisibility === 'PUBLIC';
}

export function redactEmail<T extends { id: string; email?: string; emailVisibility?: EmailVisibility | null } | null | undefined>(
	user: T,
	viewer: EmailViewer,
): T {
	if (!user) return user;
	if (canViewEmail(user, viewer)) return user;
	return { ...user, email: '' };
}
