export async function load({ params, url }) {
	const type = url.searchParams.get('type') || 'materials';
	return { type };
}
