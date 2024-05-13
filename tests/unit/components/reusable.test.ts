import { describe, it, expect, beforeEach } from 'vitest';
import { Tag } from '$lib';

describe('Tag Component', () => {
	let host: HTMLDivElement;

	beforeEach(() => {
		host = document.createElement('div');
		document.body.appendChild(host);
	});

	it('should render tag', () => {
		const instance = new Tag({ target: host, props: { tagText: 'example' } });
		expect(instance).toBeTruthy();
		expect(host.innerHTML).toContain('example');
		expect(host.innerHTML).toContain('<!--<Tag>-->');
	});

	it('should not display tag if tagText is empty', () => {
		const instance = new Tag({ target: host, props: { tagText: '' } });
		expect(instance).toBeTruthy();

		// should not render anything besides the comment that the tag is there
		expect(host.innerHTML).toContain('<!--<Tag>-->');
		expect(host.innerHTML).not.toContain('</p>');
		expect(host.innerHTML).not.toContain('<p');
	});
});
