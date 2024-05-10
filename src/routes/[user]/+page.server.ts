import type { PageServerLoad } from './$types';
import type {User} from "@prisma/client";
import {error} from '@sveltejs/kit';

/**
 * User is the slug in the parameter.
 * Fetch the user with the given slug.
 * It could be a user id which is bad for SEO or a slug from their name which is much preferable!
 * Examples of slugs: 'john-doe', 'jane-doe', 'jane-smith'
 */
export const load: PageServerLoad = async ({params, fetch}) => {
    // {fetch, params}
    const uRes = await fetch(`/api/user/${params.user}`);

    console.log(uRes.status, uRes.statusText);

    if (uRes.status !== 200) {
        error(uRes.status, uRes.statusText);
    }

    const user:User = await uRes.json();
    return {user};
};

