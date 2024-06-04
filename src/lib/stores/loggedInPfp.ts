import { type Writable, writable } from 'svelte/store';

export const loggedInPfp: Writable<string> = writable<string>('');
