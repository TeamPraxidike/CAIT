import type { LayoutServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import type { FetchedFileArray } from '$lib/database';
import type {
	File as PrismaFile,
	Material,
	Publication,
	Tag,
	User,
} from '@prisma/client';

export const load: LayoutServerLoad = async ({ params, fetch }) => {
	const pRes = await fetch(`/api/material/${params.publication}`);
	if (pRes.status !== 200) error(pRes.status, pRes.statusText);

	const loadedPublication: PublicationViewLoad = await pRes.json();

	return {
		loadedPublication,
	} satisfies {
		loadedPublication: PublicationViewLoad;
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
		};
	};
};
