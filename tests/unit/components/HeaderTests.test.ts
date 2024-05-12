import { describe, it, expect, beforeEach } from 'vitest';
import { Header } from '$lib';

describe('Header Component', () => {
	let host: HTMLDivElement;

	beforeEach(() => {
		host = document.createElement('div');
		document.body.appendChild(host);
	});

	it('should render header', () => {
		const instance = new Header({ target: host, props: {} });
		expect(instance).toBeTruthy();
		//expect(host.innerHTML).toContain("example");
		expect(host.innerHTML).toContain('<!--<Header>-->');
	});
});
