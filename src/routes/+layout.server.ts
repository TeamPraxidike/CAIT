import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async ({ locals, cookies, fetch, depends }) => {
  // const { session } = await safeGetSession()
  // return {
  //   session,
  //   cookies: cookies.getAll(),
  // }

  // By calling depends(), you tell SvelteKit that this load function
  // should be re-run whenever this dependency is invalidated.
  depends('supabase:auth');

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