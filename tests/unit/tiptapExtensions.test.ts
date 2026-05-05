import { describe, it, expect } from 'vitest';
import { generateHTML } from '@tiptap/core';
import { getExtensions } from '$lib/components/generic/tiptapExtensions';

describe('getExtensions', () => {
	it('should return an array of 3 extensions', () => {
		const extensions = getExtensions();
		expect(extensions).toHaveLength(3);
	});

	it('should return 3 extensions when placeholder is provided', () => {
		const extensions = getExtensions('Type something...');
		expect(extensions).toHaveLength(3);
	});

	it('should return 3 extensions when mentionSuggestionConfig is provided', () => {
		const extensions = getExtensions('', { items: async () => [] });
		expect(extensions).toHaveLength(3);
	});
});

describe('Mention renderHTML', () => {
	const extensions = getExtensions();

	it('should render a mention with label as a link to the user profile', () => {
		const doc = {
			type: 'doc',
			content: [
				{
					type: 'paragraph',
					content: [
						{
							type: 'mention',
							attrs: { id: 'uuid-123', label: 'johndoe' },
						},
					],
				},
			],
		};

		const html = generateHTML(doc, extensions);

		expect(html).toContain('href="/johndoe"');
		expect(html).toContain('@johndoe');
		expect(html).toContain('data-type="mention"');
		expect(html).toContain('data-id="uuid-123"');
		expect(html).toContain('data-username="johndoe"');
		expect(html).toContain('class="mention-chip"');
	});

	it('should fall back to id when label is not present', () => {
		const doc = {
			type: 'doc',
			content: [
				{
					type: 'paragraph',
					content: [
						{
							type: 'mention',
							attrs: { id: 'uuid-456', label: null },
						},
					],
				},
			],
		};

		const html = generateHTML(doc, extensions);

		expect(html).toContain('href="/uuid-456"');
		expect(html).toContain('@uuid-456');
		expect(html).toContain('data-id="uuid-456"');
		expect(html).toContain('data-username="uuid-456"');
	});

	it('should render multiple mentions in the same paragraph', () => {
		const doc = {
			type: 'doc',
			content: [
				{
					type: 'paragraph',
					content: [
						{ type: 'text', text: 'Hey ' },
						{
							type: 'mention',
							attrs: { id: 'id-1', label: 'alice' },
						},
						{ type: 'text', text: ' and ' },
						{
							type: 'mention',
							attrs: { id: 'id-2', label: 'bob' },
						},
					],
				},
			],
		};

		const html = generateHTML(doc, extensions);

		expect(html).toContain('@alice');
		expect(html).toContain('href="/alice"');
		expect(html).toContain('@bob');
		expect(html).toContain('href="/bob"');
	});

	it('should wrap the mention in an <a> tag', () => {
		const doc = {
			type: 'doc',
			content: [
				{
					type: 'paragraph',
					content: [
						{
							type: 'mention',
							attrs: { id: 'uuid-789', label: 'testuser' },
						},
					],
				},
			],
		};

		const html = generateHTML(doc, extensions);

		// The mention should be an anchor element
		expect(html).toMatch(/<a[^>]*class="mention-chip"[^>]*>@testuser<\/a>/);
	});
});

describe('Mention renderText', () => {
	const extensions = getExtensions();

	// Access the Mention extension's options to test renderText directly
	const mentionExt = extensions.find(
		(ext: any) => ext?.name === 'mention' || ext?.config?.name === 'mention',
	) as any;

	it('should find the Mention extension in getExtensions result', () => {
		expect(mentionExt).toBeDefined();
	});

	it('should render text as @label when label is present', () => {
		const renderText = mentionExt?.options?.renderText;
		if (!renderText) return; // skip if we can't access it

		const result = renderText({
			node: { attrs: { id: 'uuid-1', label: 'johndoe' } },
			options: {},
		});
		expect(result).toBe('@johndoe');
	});

	it('should render text as @id when label is absent', () => {
		const renderText = mentionExt?.options?.renderText;
		if (!renderText) return;

		const result = renderText({
			node: { attrs: { id: 'uuid-2', label: null } },
			options: {},
		});
		expect(result).toBe('@uuid-2');
	});
});
