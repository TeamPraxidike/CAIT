import { signIn } from '$lib/database/auth';
import type { Actions } from './$types';

export const actions = { default: signIn } satisfies Actions;
