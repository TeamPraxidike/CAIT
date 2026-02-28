import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { searchUsersByQuery } from '$lib/database/user';
import { profilePicFetcher } from '$lib/database/file';

export const GET: RequestHandler = async ({ url }) => {
	const query = url.searchParams.get('q')?.trim() ?? '';

	// If the query is empty, return an empty array
	if (!query) {
		return json([]);
	}

	try {
		// Get the raw users from the database
		const users = await searchUsersByQuery(query, 5);

		// Map the users and resolve their profile pictures asynchronously
		const formattedUsers = await Promise.all(
			users.map(async (user) => {
				// Fetch the picture data
				const fetchedPic = await profilePicFetcher(user.profilePic);

				return {
					id: user.id,
					username: user.username,
					firstName: user.firstName,
					lastName: user.lastName,
					profilePicData: fetchedPic.data ?? undefined,
				};
			}),
		);

		return json(formattedUsers);
	} catch (error) {
		console.error('[User Search API] Error fetching users:', error);
		return json({ error: 'Failed to search users' }, { status: 500 });
	}
};
