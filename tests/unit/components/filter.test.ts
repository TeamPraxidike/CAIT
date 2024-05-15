import { beforeEach, describe, expect, it } from 'vitest';
import { Filter } from '$lib';

describe('Filter Component', () => {
	let host: HTMLDivElement;

	beforeEach(() => {
		host = document.createElement('div');
		document.body.appendChild(host);
	});

	it('should render Filter non active', () => {
		const instance = new Filter({
			target: host,
			props: {
				label: 'Filter',
				selected: [],
				all: ['Option1', 'Option2', 'Option3'],
				display: [],
				active: false,
				profilePic: false,
			},
		});
		expect(instance).toBeTruthy();
		expect(host.innerHTML).toContain('Filter');
		expect(host.innerHTML).not.toContain('Option1');
		expect(host.innerHTML).not.toContain('Option2');
		expect(host.innerHTML).not.toContain('Option3');

		expect(host.innerHTML).toContain('<!--<Filter>-->');
	});

	it('should render Filter active with pictures but nothing in the search bar', () => {
		const instance = new Filter({
			target: host,
			props: {
				label: 'Filter',
				selected: [],
				all: ['Option1', 'Option2', 'Option3'],
				display: [],
				active: true,
				profilePic: true,
			},
		});
		expect(instance).toBeTruthy();
		expect(host.innerHTML).toContain('Filter');
		expect(host.innerHTML).not.toContain('Option1');
		expect(host.innerHTML).not.toContain('Option2');
		expect(host.innerHTML).not.toContain('Option3');
		expect(host.innerHTML).toContain('No Matching filter');

		expect(host.innerHTML).toContain('<!--<Filter>-->');
	});

	it('should render Filter active with pictures and some display setting', () => {
		const instance = new Filter({
			target: host,
			props: {
				label: 'Filter',
				selected: [],
				all: ['Option1', 'Option2', 'Option3'],
				display: ['Option1', 'Option2'],
				active: true,
				profilePic: true,
			},
		});
		expect(instance).toBeTruthy();
		expect(host.innerHTML).toContain('Filter');
		expect(host.innerHTML).toContain('Option1');
		expect(host.innerHTML).toContain('Option2');
		expect(host.innerHTML).not.toContain('Option3');

		expect(host.innerHTML).toContain('<!--<Filter>-->');
	});
});
