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
	Reply,
	Tag,
	User,
} from '@prisma/client';
import type { FileURL } from '$lib/database/fileURL';
import type { Publication } from '$lib/database/db';

export const load: LayoutServerLoad = async ({
	params,
	fetch,
	locals,
	parent,
	url,
}) => {
	await parent();

	//const session = await locals.safeGetSession();
	const session = locals.session
	if (!session || !session.user) throw redirect(303, '/signin');

	const draftToken = url.searchParams.get('draftToken');
	const draftQuery = draftToken ? `?draftToken=${encodeURIComponent(draftToken)}` : '';
	const publicationResponse = await fetch(`/api/publication/${params.publication}${draftQuery}`);
	if (publicationResponse.status !== 200) error(publicationResponse.status, publicationResponse.statusText);

	const userRes = await fetch(
		`/api/user/${session.user.id}/publicationInfo/${params.publication}`,
	);
	if (userRes.status !== 200) error(userRes.status, userRes.statusText);

	const userSpecificInfo = await userRes.json();
	const pubView: PublicationView = await publicationResponse.json();

	const cRes = await fetch(`/api/user/${session.user.id}/liked/comment`);
	const rRes = await fetch(`/api/user/${session.user.id}/liked/reply`);

	const likedComments = cRes.status === 200 ? await cRes.json() : [];
	const likedReplies = rRes.status === 200 ? await rRes.json() : [];

	// This fetches the files for a material publication
	// Utilizes "Streaming with promises" in SvelteKit
	async function fetchFiles() {
		try {
			const res = await fetch(`/api/material/${params.publication}/files${draftQuery}`);
			if (!res.ok && res.status === 404) {
				// it is not a material publication, possible so we handle gracefully
				return null;
			}
			else if (!res.ok){
				// something definitely went wrong here
				throw new Error(`Failed to load files: ${res.statusText}`);
			}
			const fileData: FetchedFileArray = await res.json();

			return fileData;
		} catch (err) {
			console.error('Error while getting files, page.server:\n', err);
		}
	}

	return {
		userSpecificInfo,
		pubView,
		fetchedFiles: fetchFiles(),
		likedComments,
		likedReplies,
	};
};

export type UserPfp = User & {
	profilePicData: string;
};
/**
 * The data that is loaded for the pubView view layout.
 * Only to be used in the pubView view layout or child pages.
 */

export type PublicationView = {
	isMaterial: boolean;
	//fileData: Promise<FetchedFileArray>;
	publication: Publication & {
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
			fileURLs: FileURL[]
		};
		circuit: Circuit & {
			nodes: (PrismaNode & {
				publication: Publication & {
					tags: Tag[];
					publisher: UserPfp;
					coverPicData: string;
					materials: Material;
				};
				prerequisites: Edge[];
				next: Edge[];
			})[];
		};
		coverPicData: string;
	};
	coverFileData: FetchedFileItem;
};
