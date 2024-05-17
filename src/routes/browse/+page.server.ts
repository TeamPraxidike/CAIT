export async function load({ url, fetch }) {
	const type = url.searchParams.get('type') || 'materials';

	// get all the materials
	const pubRes = await fetch(`/api/material`);
	const body = await pubRes.json();

	const users = await fetch(`/api/user`);
	const bodyUsers = await users.json();

	return { type, publications: body, users: bodyUsers };
}

export const actions = {
	search: async ({ request }) => {},
};
