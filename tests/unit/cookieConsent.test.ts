import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { get } from 'svelte/store';

// Force the store's `browser` guard on so the localStorage persistence runs.
vi.mock('$app/environment', () => ({ browser: true }));

const STORAGE_KEY = 'cait-cookie-consent';

// The store reads localStorage at import time, so each test imports a fresh
// copy after seeding localStorage.
async function freshStore() {
	vi.resetModules();
	return (await import('$lib/stores/cookieConsent')).cookieConsent;
}

describe('cookieConsent store', () => {
	beforeEach(() => {
		localStorage.clear();
	});
	afterEach(() => {
		localStorage.clear();
	});

	it('defaults to null when nothing is stored', async () => {
		const cookieConsent = await freshStore();
		expect(get(cookieConsent)).toBeNull();
	});

	it('hydrates the initial value from localStorage', async () => {
		localStorage.setItem(STORAGE_KEY, 'accepted');
		const cookieConsent = await freshStore();
		expect(get(cookieConsent)).toBe('accepted');
	});

	it('ignores an invalid stored value', async () => {
		localStorage.setItem(STORAGE_KEY, 'garbage');
		const cookieConsent = await freshStore();
		expect(get(cookieConsent)).toBeNull();
	});

	it('persists "accepted" to localStorage when set', async () => {
		const cookieConsent = await freshStore();
		cookieConsent.set('accepted');
		expect(localStorage.getItem(STORAGE_KEY)).toBe('accepted');
	});

	it('persists "declined" to localStorage when set', async () => {
		const cookieConsent = await freshStore();
		cookieConsent.set('declined');
		expect(localStorage.getItem(STORAGE_KEY)).toBe('declined');
	});

	it('clears localStorage when reset to null', async () => {
		localStorage.setItem(STORAGE_KEY, 'accepted');
		const cookieConsent = await freshStore();
		cookieConsent.set(null);
		expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
	});
});
