import { beforeEach, describe, expect, it } from 'vitest';
import { TheoryAppBar } from '$lib';

describe('TheoryAppBar Component', () => {
	let host: HTMLDivElement;

	beforeEach(() => {
		host = document.createElement('div');
		document.body.appendChild(host);
	});

	it('should render theoryAppBar', () => {
		const instance = new TheoryAppBar({ target: host, props: { value: 0.63 } });
		expect(instance).toBeTruthy();
		expect(host.innerHTML).toContain('Theory');
		expect(host.innerHTML).toContain('Practice');
		expect(host.innerHTML).toContain('63%');
		expect(host.innerHTML).toContain('37%');
		expect(host.innerHTML).toContain('<!--<TheoryAppBar>-->');
	});

	it('should render theoryAppBar 100% theory', () => {
		const instance = new TheoryAppBar({ target: host, props: { value: 0 } });
		expect(instance).toBeTruthy();
		expect(host.innerHTML).toContain('Theory');
		expect(host.innerHTML).toContain('Practice');
		expect(host.innerHTML).toContain('0%');
		expect(host.innerHTML).toContain('100%');
		expect(host.innerHTML).toContain('<!--<TheoryAppBar>-->');
	});

	it('should render theoryAppBar 100% practice', () => {
		const instance = new TheoryAppBar({ target: host, props: { value: 1 } });
		expect(instance).toBeTruthy();
		expect(host.innerHTML).toContain('Theory');
		expect(host.innerHTML).toContain('Practice');
		expect(host.innerHTML).toContain('100%');
		expect(host.innerHTML).toContain('0%');
		expect(host.innerHTML).toContain('<!--<TheoryAppBar>-->');
	});
});
