import { beforeEach, describe, expect, it } from 'vitest';
import MaterialDetails from '$lib/components/publication/preview/MaterialDetails.svelte';

describe('MaterialDetails', () => {
	let host: HTMLDivElement;

	beforeEach(() => {
		host = document.createElement('div');
		document.body.replaceChildren(host);
	});

	it('shows a readable duration and links a predefined license', () => {
		new MaterialDetails({
			target: host,
			props: {
				timeEstimate: 90,
				copyright: 'CC BY-SA',
				selfMade: true,
			},
		});

		const licenseLink = host.querySelector<HTMLAnchorElement>('a');

		expect(host.textContent).toContain('1 hour 30 minutes');
		expect(host.textContent).toContain('Created by uploader');
		expect(host.textContent).toContain('Yes');
		expect(licenseLink?.href).toBe('https://creativecommons.org/licenses/by-sa/4.0/');
		expect(licenseLink?.target).toBe('_blank');
		expect(licenseLink?.rel).toBe('noopener noreferrer');
	});

	it('renders custom license text without creating a misleading link', () => {
		new MaterialDetails({
			target: host,
			props: {
				copyright: 'Custom institutional terms',
			},
		});

		expect(host.textContent).toContain('Custom institutional terms');
		expect(host.querySelector('a')).toBeNull();
	});

	it('uses a clear empty state when metadata is missing', () => {
		new MaterialDetails({ target: host });

		expect(host.textContent?.match(/Not specified/g)).toHaveLength(2);
	});
});
