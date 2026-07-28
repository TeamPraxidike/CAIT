import { afterEach, describe, expect, it, vi } from 'vitest';
import { load, pickRandomPublication } from '../../src/routes/+page.server';

afterEach(() => vi.restoreAllMocks());

describe('homepage featured publication', () => {
	it('picks a publication using the supplied random value', () => {
		const publications = Array.from({ length: 10 }, (_, index) => index + 1);

		expect(pickRandomPublication(publications, () => 0)).toBe(1);
		expect(pickRandomPublication(publications, () => 0.99)).toBe(10);
	});

	it('returns null when there are no publications', () => {
		expect(pickRandomPublication([], vi.fn())).toBeNull();
	});

	it('loads and selects from the ten most-liked publications', async () => {
		vi.spyOn(Math, 'random').mockReturnValue(0.5);
		const publications = Array.from({ length: 10 }, (_, index) => ({ id: index + 1 }));
		const fetch = vi.fn()
			.mockResolvedValueOnce({
				json: async () => ({ usersProfilePics: [] }),
			})
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ materials: publications }),
			});

		const result = await (load as any)({ fetch });

		expect(fetch).toHaveBeenCalledWith('/api/material?sort=Most%20Liked&amount=10');
		expect(result.featuredPublication).toEqual({ id: 6 });
	});
});
