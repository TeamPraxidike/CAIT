import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest';
import { tick } from 'svelte';
import {
	arrow,
	autoUpdate,
	computePosition,
	flip,
	offset,
	shift,
} from '@floating-ui/dom';
import { storePopup } from '@skeletonlabs/skeleton';
import {
	Difficulty,
	MaterialType,
	PublicationType,
	type Material,
	type Publication,
} from '@prisma/client';
import {
	generateRandomString,
	randomEnumValue,
} from '../../utility/publicationsUtility';
import { createUniqueUser } from '../../utility/users.ts';

const pageState = {
	data: { session: { user: { id: '12313' } } },
};

const mockUser = { ...(await createUniqueUser()), profilePicData: '' };

vi.mock('$app/state', () => ({
	page: pageState,
}));

describe('Publication Card', () => {
		let host: HTMLDivElement;
		let PublicationCard: typeof import('$lib/components/PublicationCard.svelte').default;

		const buildMaterial = (publicationId: number): Material => ({
			id: 1,
			copyright: generateRandomString(10),
			encapsulatingType: randomEnumValue(MaterialType),
			timeEstimate: 3,
			theoryPractice: 0.5,
			publicationId,
		});

		const buildPublication = (
			overrides: Partial<
				Publication & {
					materials: Material;
					tags: { content: string }[];
					usedInCourse: { course: string }[];
					course: { educationalLevel: string } | null;
				}
			> = {},
		) => {
			const base: Publication = {
				id: 101,
				title: generateRandomString(),
				description: generateRandomString(40),
				difficulty: randomEnumValue(Difficulty),
				likes: 4,
				learningObjectives: [],
				prerequisites: [],
				createdAt: new Date(),
				updatedAt: new Date(),
				isDraft: false,
				courseId: null,
				publisherId: 'user-1',
				type: PublicationType.Material,
			};

			return {
				...base,
				materials: buildMaterial(base.id),
				tags: [{ content: 'tag-a' }, { content: 'tag-b' }],
				usedInCourse: [{ course: 'Course 1' }],
				course: { educationalLevel: 'bachelor' },
				...overrides,
			};
		};

		// Flush microtasks triggered by async handlers.
		const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

		beforeEach(async () => {
			host = document.createElement('div');
			document.body.appendChild(host);
			vi.resetModules();
			storePopup.set({
				computePosition,
				autoUpdate,
				flip,
				shift,
				offset,
				arrow,
			});
			PublicationCard = (await import('$lib/components/PublicationCard.svelte'))
				.default;
			vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));

			vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
				width: 1000,
				height: 0,
				top: 0,
				left: 0,
				right: 1000,
				bottom: 0,
				x: 0,
				y: 0,
				toJSON: () => {},
			} as DOMRect);
		});

		afterEach(() => {
			vi.clearAllMocks();
		});

		it('renders core details and draft badge', async () => {
			const publication = buildPublication({ isDraft: true });

			const instance = new PublicationCard({
				target: host,
				props: {
					publication,
					publisher: mockUser,
					liked: true,
					saved: true,
					extensions: ['pdf'],
					materialType: 'slides',
					imgSrc: null,
				},
			});

			expect(instance).toBeTruthy();
			expect(host.innerHTML).toContain(publication.title);
			expect(host.innerHTML).toContain(publication.description);
			expect(host.innerHTML).toContain('Draft');
			expect(host.innerHTML).toContain('View');
			expect(host.innerHTML).toContain('tag-a');

			const profileImg = host.querySelector(
				'[data-testid="publication-card-profile-img"]',
			) as HTMLImageElement | null;
			expect(profileImg?.getAttribute('src')).toContain(
				'/defaultProfilePic/profile.jpg',
			);
		});

		it('dispatches liked and saved events with updated counts', async () => {
			const publication = buildPublication({ likes: 6 });
			const likedHandler = vi.fn();
			const savedHandler = vi.fn();

			const instance = new PublicationCard({
				target: host,
				props: {
					publication,
					publisher: mockUser,
					liked: true,
					saved: false,
					extensions: ['pdf'],
					materialType: 'slides',
					imgSrc: null,
				},
			});

			instance.$on('liked', likedHandler);
			instance.$on('saved', savedHandler);

			const likeButton = Array.from(host.querySelectorAll('button')).find(
				(button) => button.textContent?.includes('6'),
			) as HTMLButtonElement;
			likeButton.click();
			await flushPromises();
			await tick();

			expect(host.innerHTML).toContain('5');
			expect(likedHandler).toHaveBeenCalledTimes(1);
			expect(likedHandler.mock.calls[0][0].detail).toEqual({
				id: publication.id,
			});

			const saveButton = host.querySelector(
				`button[aria-label="Save publication ${publication.title}"]`,
			) as HTMLButtonElement;
			saveButton.click();
			await flushPromises();
			await tick();

			expect(savedHandler).toHaveBeenCalledTimes(1);
			expect(savedHandler.mock.calls[0][0].detail).toEqual({
				id: publication.id,
			});

			const fetchMock = vi.mocked(fetch);
			expect(fetchMock).toHaveBeenCalledWith(
				`/api/user/${pageState.data.session.user.id}/liked/${publication.id}`,
				expect.objectContaining({ method: 'POST' }),
			);
			expect(fetchMock).toHaveBeenCalledWith(
				`/api/user/${pageState.data.session.user.id}/saved/${publication.id}`,
				expect.objectContaining({ method: 'POST' }),
			);
		});
	});
