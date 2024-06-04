export async function load({ url, fetch, cookies }) {
	const userId = cookies.get('userId');
	const type = url.searchParams.get('type') || 'materials';
	console.log('Me here');
	const { materials, fileData } =
		type === 'materials'
			? await (await fetch(`/api/material`)).json()
			: { materials: [], fileData: [] };
	const circuits =
		type === 'circuits'
			? await (await fetch(`/api/circuit`)).json()
			: { circuits: [] };
	const { users, profilePics } = await (await fetch(`/api/user`)).json();
	const tags = await (await fetch(`/api/tags`)).json();

	const likedResponse = await fetch(`/api/user/${userId}/liked`);
	const liked =
		likedResponse.status === 200 ? await likedResponse.json() : [];

	const savedResponse = await fetch(
		`/api/user/${userId}/saved?fullPublications=false`,
	);
	const saved =
		savedResponse.status === 200
			? await savedResponse.json()
			: { saved: [] };

	return {
		type,
		materials,
		fileData,
		circuits,
		users,
		tags,
		liked,
		saved,
		profilePics,
	};
}

export type material = {
	publication: {
		tags: {
			content: string;
		}[];
		coverPic: {
			path: string;
			title: string;
			type: string;
			coverId: number | null;
			materialId: number | null;
		} | null;
		usedInCourse: string[];
	};
	files: {
		path: string;
		title: string;
		type: string;
	};
};
