export async function load({ url, fetch }) {
	const type = url.searchParams.get('type') || 'materials';

	// get all the materials
	const pubRes = await fetch(`/api/material`);
	const body = await pubRes.json();

	const users = await fetch(`/api/user`);
	const bodyUsers = await users.json();

	const tags = await fetch(`/api/tags`);
	const bodyTags = await tags.json();

	return { type, publications: body, users: bodyUsers, tags: bodyTags };
}

export const actions = {
	search: async ({ request }) => {},
};
