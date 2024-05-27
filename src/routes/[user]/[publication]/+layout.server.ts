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

export const load: LayoutServerLoad = async ({ params, fetch , cookies}) => {
	const pRes = await fetch(`/api/material/${params.publication}`);
	if (pRes.status !== 200) error(pRes.status, pRes.statusText);

	console.log("current user is: " + cookies.get("userId"));

	const likedRes = await fetch(`/api/user/${cookies.get("userId")}/liked/${params.publication}`);
	if(likedRes.status !== 200) error(likedRes.status, likedRes.statusText);

	const liked = await likedRes.json();
	const loadedPublication = {loadedPublication: await pRes.json(), liked: liked};

	return {
		loadedPublication
	} satisfies {
		loadedPublication: PublicationViewLoad;
	};
};


export type PublicationViewLoad = {
	loadedPublication: PublicationView,
	liked: boolean
}
/**
 * The data that is loaded for the publication view layout.
 * Only to be used in the publication view layout or child pages.
 */
export type PublicationView = {
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
