import { type Writable, writable } from 'svelte/store';

export const coursesStore: Writable<{publicationId: number, courses: string[]}[]> = writable([]);