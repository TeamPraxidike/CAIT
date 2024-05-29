import type { LayoutServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import type { FetchedFileArray, FetchedFileItem } from '$lib/database';
import type {
	File as PrismaFile,
	Material,
	Publication,
	Tag,
	Circuit,
	User,
	Comment,
	Reply,
	Node as PrismaNode,
	Edge,
} from '@prisma/client';

export const load: LayoutServerLoad = async ({ params, fetch, cookies }) => {
	//const pRes = await fetch(`/api/material/${params.publication}`);
	const pRes = await fetch(`/api/publication/${params.publication}`);

	if (pRes.status !== 200) error(pRes.status, pRes.statusText);

	const userRes = await fetch(
		`/api/user/${cookies.get('userId')}/publicationInfo/${params.publication}`,
	);
	if (userRes.status !== 200) error(userRes.status, userRes.statusText);

	const userSpecificInfo = await userRes.json();
	const loadedPublication = {
		loadedPublication: await pRes.json(),
		userSpecificInfo: userSpecificInfo,
	};

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

export type PublicationViewLoad = {
	loadedPublication: PublicationView;
	userSpecificInfo: { liked: boolean; saved: boolean };
};
/**
 * The data that is loaded for the publication view layout.
 * Only to be used in the publication view layout or child pages.
 */
export type PublicationView = {
	isMaterial: boolean;
	fileData: FetchedFileArray;
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
		materials: Material & {
			files: PrismaFile[];
		};

		circuit: Circuit & {
			nodes: (PrismaNode & {
				prerequisites: Edge[];
				next: Edge[];
			})[];
		};
	};

	// material: Material & {
	// 	files: PrismaFile[];
	// 	publication: Publication & {
	// 		tags: Tag[];
	// 		publisher: User;
	// 		maintainers: User[];
	// 		comments: (Comment & {
	// 			replies: (Reply & {
	// 				user: User;
	// 			})[];
	// 			user: User;
	// 		})[];
	// 	};
	// };
	// circuit: Circuit & {
	// 	nodes: (PrismaNode & {
	// 		prerequisites: Edge[];
	// 		next: Edge[];
	// 	})[];
	// };
	coverFileData: FetchedFileItem;
};
