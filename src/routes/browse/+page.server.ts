export async function load({ url, fetch }) {
	const type = url.searchParams.get('type') || 'materials';

	// get all the materials
	const { materials, fileData } = await (await fetch(`/api/material`)).json();
	const {users, profilePics} = await (await fetch(`/api/user`)).json();
	const tags = await (await fetch(`/api/tags`)).json();
	return { type, materials, fileData, users, profilePics, tags };
}
