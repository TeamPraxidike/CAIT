import {type Writable, writable} from "svelte/store";


type AuthStruct = {
    userid: number|null,
    session: string|null,
}

/**
 * The AuthStore interface
 *
 * This is the interface for the AuthStore, which is a writable store that holds the auth data.
 * The store will hold the userid and session, and will save the data to the sessionStorage.
 */
interface AuthStore {
    subscribe: (run: (value: AuthStruct) => void, invalidate?: (value?: AuthStruct) => void) => () => void,
    setAuth: (userid: number, session: string) => void,
    clearAuth: () => void,
}

/**
 * Create a writable store for the auth data
 *
 * @returns The writable store, with the following methods:
 * - setAuth(userid: number, session: string) - will set the userid and session
 * - clearAuth() - will set the userid and session to null
 * - subscribe - the standard svelte store subscribe method
 *
 * The store will also save the data to the sessionStorage, so it will persist between page reloads.
 * The data is saved under the key 'authStore'.
 *
 * @link https://svelte.dev/docs/svelte-store#writable
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage
 */
const createAuthStore = ():AuthStore => {
    let initialData: AuthStruct = {userid: null, session: null};

    if (typeof window !== 'undefined') {
        const sessionData = window.sessionStorage.getItem('authStore');
        if (sessionData) {
            initialData = JSON.parse(sessionData);
        }
    }

    const store:Writable<AuthStruct> = writable(initialData);

    store.subscribe(($store) => {
        if (typeof window !== 'undefined') {
            window.sessionStorage.setItem('authStore', JSON.stringify($store));
        }
    });

    const {subscribe, set} = store;

    return {
        subscribe,
        setAuth: (userid: number, session: string) => {
            set({userid, session});
        },
        clearAuth: () => {
            set({userid: null, session: null});
        }
    };
}

/* Create the store */
export const authStore = createAuthStore();