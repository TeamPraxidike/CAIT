import type { LayoutServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import type { FetchedFileArray, FetchedFileItem } from '$lib/database';
import type {
	File as PrismaFile,
	Material,
	Publication,
	Tag,
	User,
	Comment,
	Reply,
} from '@prisma/client';

export const load: LayoutServerLoad = async ({ params, fetch }) => {
	const pRes = await fetch(`/api/material/${params.publication}`);
	if (pRes.status !== 200) error(pRes.status, pRes.statusText);

	const loadedPublication: PublicationViewLoad = await pRes.json();

	//const userId = cookies.get('browsingUser');
	//const cRes = await fetch(`/api/user/${userId}/liked/comment`);
	const cRes = await fetch(`/api/user/1/liked/comment`);
	//const rRes = await fetch(`/api/user/${userId}/liked/comment`);
	const rRes = await fetch(`/api/user/1/liked/reply`);

	const likedComments = cRes.status === 200 ? await cRes.json() : [];
	const likedReplies = rRes.status === 200 ? await rRes.json() : [];

	return {
		loadedPublication,
		likedComments,
		likedReplies,
	} satisfies {
		loadedPublication: PublicationViewLoad;
		likedComments: number[];
		likedReplies: number[];
	};
};

/**
 * The data that is loaded for the publication view layout.
 * Only to be used in the publication view layout or child pages.
 */
export type PublicationViewLoad = {
	fileData: FetchedFileArray;
	material: Material & {
		files: PrismaFile[];
		publication: Publication & {
			tags: Tag[];
			publisher: User;
			maintainers: User[];
			comments: (Comment & {
				replies: (Reply & {
					user: User;
				})[];
				user: User;
			})[];
		};
	};
	coverFileData: FetchedFileItem;
};
