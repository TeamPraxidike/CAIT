import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { get } from 'svelte/store';
import { CookieBanner } from '$lib';
import { cookieConsent } from '$lib/stores/cookieConsent';

describe('CookieBanner Component', () => {
	let host: HTMLDivElement;

	beforeEach(() => {
		host = document.createElement('div');
		document.body.appendChild(host);
		cookieConsent.set(null);
	});
	afterEach(() => {
		cookieConsent.set(null);
		host.remove();
	});

	it('is shown while the choice is undecided', () => {
		new CookieBanner({ target: host });
		expect(host.querySelector('[role="dialog"]')).not.toBeNull();
	});

	it('is hidden once a choice has been made', () => {
		cookieConsent.set('accepted');
		new CookieBanner({ target: host });
		expect(host.querySelector('[role="dialog"]')).toBeNull();
	});

	function clickButton(label: string) {
		const btn = [...host.querySelectorAll('button')].find(
			(b) => b.textContent?.trim() === label,
		);
		if (!btn) throw new Error(`button "${label}" not found`);
		btn.click();
	}

	it('sets consent to accepted when Accept is clicked', () => {
		new CookieBanner({ target: host });
		clickButton('Accept');
		expect(get(cookieConsent)).toBe('accepted');
	});

	it('sets consent to declined when Decline is clicked', () => {
		new CookieBanner({ target: host });
		clickButton('Decline');
		expect(get(cookieConsent)).toBe('declined');
	});
});
