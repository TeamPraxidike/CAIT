import { describe, expect, it } from 'vitest';
import CopyrightPopup from '$lib/components/publication/CopyrightPopup.svelte';

describe('CopyrightPopup ownership', () => {
	it('uses supplied ownership for guidance without asking again', () => {
		const host = document.createElement('div');
		const popup = new CopyrightPopup({
			target: host,
			props: { ownershipStatus: 'yes' },
		});

		expect(host.textContent).not.toContain('Do you own the material?');
		expect(host.textContent).toContain('License selection');
		expect(host.querySelector('img')).toHaveAttribute(
			'alt',
			'Reference image for users who own the material',
		);

		popup.$destroy();
	});

	it('allows license selection without ownership-specific guidance', () => {
		const host = document.createElement('div');
		const popup = new CopyrightPopup({ target: host });
		const applyButton = Array.from(host.querySelectorAll('button')).find(
			(button) => button.textContent?.trim() === 'Apply',
		);

		expect(host.textContent).not.toContain('Do you own the material?');
		expect(host.textContent).toContain('License selection');
		expect(host.querySelector('img')).toBeNull();
		expect(applyButton).not.toBeDisabled();

		popup.$destroy();
	});
});
