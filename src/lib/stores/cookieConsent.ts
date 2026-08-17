import { browser } from '$app/environment';
import { type Writable, writable } from 'svelte/store';

export type CookieConsent = 'accepted' | 'declined' | null;

const STORAGE_KEY = 'cait-cookie-consent';

function readInitial(): CookieConsent {
	if (!browser) return null;
	const stored = localStorage.getItem(STORAGE_KEY);
	return stored === 'accepted' || stored === 'declined' ? stored : null;
}

// Tracks whether the user has consented to cookies from embedded third-party
// content (e.g. YouTube). `null` means the user has not decided yet.
export const cookieConsent: Writable<CookieConsent> = writable(readInitial());

if (browser) {
	cookieConsent.subscribe((value) => {
		if (value === null) localStorage.removeItem(STORAGE_KEY);
		else localStorage.setItem(STORAGE_KEY, value);
	});
}
