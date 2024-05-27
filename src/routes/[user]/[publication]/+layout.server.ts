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

	const userRes = await fetch(`/api/user/${cookies.get("userId")}/publicationInfo/${params.publication}`);
	if(userRes.status !== 200) error(userRes.status, userRes.statusText);

	const userSpecificInfo = await userRes.json();
	const loadedPublication = {loadedPublication: await pRes.json(), userSpecificInfo: userSpecificInfo};

	return {
		loadedPublication
	} satisfies {
		loadedPublication: PublicationViewLoad;
	};
};


export type PublicationViewLoad = {
	loadedPublication: PublicationView,
	userSpecificInfo: {liked: boolean, saved: boolean}
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
