import type { UserSanitizedWithProfilePicData } from '$lib';
import type { MaterialType, Publication, User } from '@prisma/client';

type FeaturedMaterial = {
	encapsulatingType: MaterialType;
	publication: Publication & {
		tags: { content: string }[];
		course?: { educationalLevel: string } | null;
	};
	publisher: Pick<User, 'username' | 'firstName' | 'lastName'> & {
		profilePicData: string | null;
	};
	coverPicData: string | null;
};

export function _pickRandomPublication<T>(publications: T[], random = Math.random): T | null {
	if (publications.length === 0) return null;

	return publications[Math.floor(random() * publications.length)];
}

export async function load({ fetch }) {
	const [usersResponse, publicationsResponse] = await Promise.all([
		fetch('/api/user/highest-rep'),
		fetch('/api/material?sort=Most%20Liked&amount=10'),
	]);
	const users: UserSanitizedWithProfilePicData[] = (await usersResponse.json()).usersProfilePics;
	let publications: FeaturedMaterial[] = [];

	if (publicationsResponse.ok) {
		publications = (await publicationsResponse.json()).materials;
	}

	return {
		topUsers: users,
		featuredPublication: _pickRandomPublication(publications),
	};
}
