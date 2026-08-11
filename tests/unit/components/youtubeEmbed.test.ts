import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { YouTubeEmbed } from '$lib';
import { cookieConsent } from '$lib/stores/cookieConsent';

const VIDEO_ID = '-Pe1rEs6RUs';

describe('YouTubeEmbed Component', () => {
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

	it('does NOT load the YouTube iframe before consent', () => {
		new YouTubeEmbed({ target: host, props: { videoId: VIDEO_ID } });
		expect(host.querySelector('iframe')).toBeNull();
		expect(host.innerHTML).not.toContain('youtube-nocookie.com');
		// placeholder prompts for consent instead
		expect(host.innerHTML).toContain('hosted on YouTube');
	});

	it('does NOT load the iframe when consent is declined', () => {
		cookieConsent.set('declined');
		new YouTubeEmbed({ target: host, props: { videoId: VIDEO_ID } });
		expect(host.querySelector('iframe')).toBeNull();
		expect(host.innerHTML).not.toContain('youtube-nocookie.com');
	});

	it('loads the nocookie iframe with the given videoId once accepted', () => {
		cookieConsent.set('accepted');
		new YouTubeEmbed({ target: host, props: { videoId: VIDEO_ID } });
		const iframe = host.querySelector('iframe');
		expect(iframe).not.toBeNull();
		expect(iframe?.getAttribute('src')).toBe(
			`https://www.youtube-nocookie.com/embed/${VIDEO_ID}`,
		);
	});

	it('reacts to consent granted after mount', async () => {
		new YouTubeEmbed({ target: host, props: { videoId: VIDEO_ID } });
		expect(host.querySelector('iframe')).toBeNull();
		cookieConsent.set('accepted');
		await Promise.resolve(); // let Svelte flush the reactive update
		expect(host.querySelector('iframe')).not.toBeNull();
	});
});
