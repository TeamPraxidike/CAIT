import { beforeEach, describe, expect, it } from 'vitest';
import { PublicationCard } from '$lib';

describe('Filter Component', () => {
	let host: HTMLDivElement;

	beforeEach(() => {
		host = document.createElement('div');
		document.body.appendChild(host);
	});

	it('should render Filter non active', () => {
		const instance = new PublicationCard({
			target: host,
			props: {
				liked: false,
				saved: false,
				used: 6,
				imgSrc: 'some_image',
				publication: {
					id: 1,
					title: 'aaa',
					description: 'string',
					difficulty: 'hard',
					likes: 2,
					learningObjectives: ['s'],
					prerequisites: ['p'],
					createdAt: new Date(),
					updatedAt: new Date(),
					publisherId: 3,
					reports: 2,
					type: 'Material',
					tags: [{ content: 'tag1' }],
				},
			},
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
