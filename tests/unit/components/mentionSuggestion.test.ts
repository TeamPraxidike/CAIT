import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('tippy.js', () => ({ default: vi.fn() }));
vi.mock('$lib/components/generic/MentionList.svelte', () => ({ default: {} }));
vi.mock('$lib/components/generic/tiptapExtensions', () => ({}));

import { mentionSuggestion } from '$lib/components/generic/mentionSuggestion';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('mentionSuggestion.items', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('should call fetch with the correct URL including encoded query', async () => {
		mockFetch.mockResolvedValue({
			ok: true,
			json: async () => [],
		});

		await mentionSuggestion.items({ query: 'alice' });

		expect(mockFetch).toHaveBeenCalledWith('/api/user/search?q=alice');
	});

	it('should return parsed JSON on success', async () => {
		const users = [
			{ id: '1', name: 'Alice' },
			{ id: '2', name: 'Bob' },
		];
		mockFetch.mockResolvedValue({
			ok: true,
			json: async () => users,
		});

		const result = await mentionSuggestion.items({ query: 'a' });

		expect(result).toEqual(users);
	});

	it('should return empty array when response is not ok', async () => {
		mockFetch.mockResolvedValue({
			ok: false,
			json: async () => ({ error: 'not found' }),
		});

		const result = await mentionSuggestion.items({ query: 'nobody' });

		expect(result).toEqual([]);
	});

	it('should return empty array when fetch throws', async () => {
		mockFetch.mockRejectedValue(new Error('Network error'));

		const result = await mentionSuggestion
			.items({ query: 'test' })
			.catch(() => []);

		expect(result).toEqual([]);
	});

	it('should properly encode special characters in query', async () => {
		mockFetch.mockResolvedValue({
			ok: true,
			json: async () => [],
		});

		await mentionSuggestion.items({ query: 'john doe & friends' });

		expect(mockFetch).toHaveBeenCalledWith(
			'/api/user/search?q=john%20doe%20%26%20friends',
		);
	});
});
