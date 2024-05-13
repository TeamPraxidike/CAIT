export async function load({ url }) {
	const type = url.searchParams.get('type') || 'materials';
	return { type };
}
