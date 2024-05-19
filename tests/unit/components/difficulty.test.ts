import { describe, it, expect, beforeEach } from 'vitest';
import { DiffBar, DifficultySelection } from '$lib';

describe('Difficulty Components', () => {
	let host: HTMLDivElement;

	beforeEach(() => {
		host = document.createElement('div');
		document.body.appendChild(host);
	});

	it('should render easy/green difficulty bar', () => {
		const instance = new DiffBar({
			target: host,
			props: { diff: 'easy' },
		});
		expect(instance).toBeTruthy();
		expect(host.innerHTML).not.toContain('bg-error-400');
		expect(host.innerHTML).not.toContain('bg-amber-400');
		expect(host.innerHTML).toContain('bg-green-500');
	});
	it('should render medium/yellow difficulty bar', () => {
		const instance = new DiffBar({
			target: host,
			props: { diff: 'medium' },
		});
		expect(instance).toBeTruthy();
		expect(host.innerHTML).not.toContain('bg-green');
		expect(host.innerHTML).not.toContain('bg-error-400');
		expect(host.innerHTML).toContain('bg-amber-400');
	});
	it('should render hard/red difficulty bar', () => {
		const instance = new DiffBar({
			target: host,
			props: { diff: 'hard' },
		});
		expect(instance).toBeTruthy();
		expect(host.innerHTML).not.toContain('bg-green');
		expect(host.innerHTML).not.toContain('bg-amber-400');
		expect(host.innerHTML).toContain('bg-error-400');
	});
	it('should render difficulty selection component and check one of them', () => {
		const instance = new DifficultySelection({
			target: host,
			props: { difficulty: 'easy' },
		});
		expect(instance).toBeTruthy();
		expect(host.innerHTML).toContain('aria-checked="true"');
	});
});
