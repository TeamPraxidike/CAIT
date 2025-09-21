import { type Writable, writable } from 'svelte/store';

export const semanticSearchActive: Writable<boolean> = writable(false)