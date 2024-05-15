import { beforeEach, describe, expect, it } from 'vitest';
import { PublicationCard, Filter } from '$lib';

describe('Filter Component', () => {
	let host: HTMLDivElement;

	beforeEach(() => {
		host = document.createElement('div');
		document.body.appendChild(host);
	});

	it('should render Filter non active', () => {
		const instance = new PublicationCard({
			target: host,
			props: { used: 6 },
		});
		expect(instance).toBeTruthy();
		expect(host.innerHTML).toContain('DiffBar');
		expect(host.innerHTML).toContain('View');
		expect(host.innerHTML).toContain('Icon');
		expect(host.innerHTML).toContain('6');
		expect(host.innerHTML).not.toContain('icon1');

		expect(host.innerHTML).toContain('<!--<PublicationCard>-->');
	});
});
