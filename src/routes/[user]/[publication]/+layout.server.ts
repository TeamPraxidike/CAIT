import type { LayoutServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import type { FetchedFileArray, FetchedFileItem } from '$lib/database';
import type {
	Circuit,
	Comment,
	Edge,
	File as PrismaFile,
	Material,
	Node as PrismaNode,
	Publication,
	Reply,
	Tag,
	User,
} from '@prisma/client';

export const load: LayoutServerLoad = async ({
	params,
	fetch,
	locals,
	parent,
}) => {
	await parent();

	const session = await locals.auth();
	if (!session) throw redirect(303, '/signin');

	const pRes = await fetch(`/api/publication/${params.publication}`);
	if (pRes.status !== 200) error(pRes.status, pRes.statusText);

	const userRes = await fetch(
		`/api/user/${session.user.id}/publicationInfo/${params.publication}`,
	);
	if (userRes.status !== 200) error(userRes.status, userRes.statusText);

	const userSpecificInfo = await userRes.json();
	const pubView = await pRes.json();

	const cRes = await fetch(`/api/user/${session.user.id}/liked/comment`);
	const rRes = await fetch(`/api/user/${session.user.id}/liked/reply`);

	const likedComments = cRes.status === 200 ? await cRes.json() : [];
	const likedReplies = rRes.status === 200 ? await rRes.json() : [];

	console.log(pubView);
	return {
		userSpecificInfo,
		pubView,
		likedComments,
		likedReplies,
	} satisfies {
		userSpecificInfo: { liked: boolean; saved: boolean };
		pubView: PublicationView;
		likedComments: number[];
		likedReplies: number[];
	};
};

type UserPfp = User & {
	profilePicData: string;
};
/**
 * The data that is loaded for the pubView view layout.
 * Only to be used in the pubView view layout or child pages.
 */
export type PublicationView = {
	isMaterial: boolean;
	fileData: FetchedFileArray;
	publication: Publication & {
		usedInCourse: { course: string }[];
		tags: Tag[];
		publisher: UserPfp;
		maintainers: UserPfp[];
		comments: (Comment & {
			replies: (Reply & {
				user: UserPfp;
			})[];
			user: UserPfp;
		})[];
		materials: Material & {
			files: PrismaFile[];
		};
		circuit: Circuit & {
			nodes: (PrismaNode & {
				publication: Publication & {
					tags: Tag[];
					usedInCourse: { course: string }[];
					publisher: UserPfp;
				};
				prerequisites: Edge[];
				next: Edge[];
			})[];
		};
	};
	coverFileData: FetchedFileItem;
};
