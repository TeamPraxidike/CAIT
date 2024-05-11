import {writable} from "svelte/store";


export const authStore = writable({user: 1, token: 12});