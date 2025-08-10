import type { LayoutServerLoad } from './$types'
import { verifyAuth } from '$lib/database/auth';
import { deleteFile } from '$lib/database';
import type { Actions } from '@sveltejs/kit';

export const load: LayoutServerLoad = async ({ locals, cookies, fetch }) => {
  // const { session } = await safeGetSession()
  // return {
  //   session,
  //   cookies: cookies.getAll(),
  // }

  const { session, user } = await locals.safeGetSession();

  let loggedUser = null

  if (user) {
    const loggedUserResp = await fetch(`/api/user/${user.id}`);
    if (loggedUserResp.ok) {
      const loggedUserBody = await loggedUserResp.json();
      loggedUser = {
        ...loggedUserBody.user,
        profilePicData: loggedUserBody.profilePicData.data
      };
    }
  }

  locals.session = session;
  locals.user = user;

  return {
    session,
    user,
    loggedUser,
    cookies: cookies.getAll(),
  };
}