import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { canEditOrRemove } from '$lib/database/auth';
import type {PublicationView, UserPfp} from "../+layout.server.ts";

export const load: LayoutServerLoad = async ({
    parent,
    params,
    locals
}) => {
    const { pubView } : {pubView: PublicationView} = await parent();
    const publisherId : string = pubView.publication.publisher.id;
    const maintainerIds : string[] = pubView.publication.maintainers.map((m : UserPfp) => m.id);

    if (!(await canEditOrRemove(locals, publisherId, maintainerIds, 'EDIT'))) {
        throw redirect(303, `/${params.user}/${params.publication}`)
    }
}