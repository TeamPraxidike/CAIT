export async function load({ url, fetch }) {
	const type = url.searchParams.get('type') || 'materials';

	// get all the materials
	const pubRes = await fetch('/api/material');
	const body = await pubRes.json();

	return { type, publications: body };
}
