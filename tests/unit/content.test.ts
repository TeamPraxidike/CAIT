import { describe, it, expect } from 'vitest';
import {
	extractPlainText,
	extractMentionedUserIds,
	trimTrailingEmptyNodes
} from '$lib/util/content';
import type { TiptapDocument, TiptapNode } from '$lib/util/content';

describe('extractPlainText', () => {
	it('should return empty string for null', () => {
		expect(extractPlainText(null)).toBe('');
	});

	it('should return empty string for undefined', () => {
		expect(extractPlainText(undefined)).toBe('');
	});

	it('should return empty string for non-doc type', () => {
		expect(extractPlainText({ type: 'doc' } as TiptapDocument)).toBe('');
	});

	it('should return empty string for doc with no content', () => {
		expect(extractPlainText({ type: 'doc' })).toBe('');
	});

	it('should return empty string for doc with empty content array', () => {
		expect(extractPlainText({ type: 'doc', content: [] })).toBe('');
	});

	it('should return text from a simple paragraph', () => {
		const doc: TiptapDocument = {
			type: 'doc',
			content: [{ type: 'paragraph', content: [{ type: 'text', text: 'hello' }] }]
		};
		expect(extractPlainText(doc)).toBe('hello');
	});

	it('should serialize mention nodes as @label using attrs.label', () => {
		const doc: TiptapDocument = {
			type: 'doc',
			content: [
				{
					type: 'paragraph',
					content: [{ type: 'mention', attrs: { id: 'user-1', label: 'Alice' } }]
				}
			]
		};
		expect(extractPlainText(doc)).toBe('@Alice');
	});

	it('should fall back to attrs.id when mention has no label', () => {
		const doc: TiptapDocument = {
			type: 'doc',
			content: [
				{
					type: 'paragraph',
					content: [{ type: 'mention', attrs: { id: 'user-1' } }]
				}
			]
		};
		expect(extractPlainText(doc)).toBe('@user-1');
	});

	it('should fall back to empty string when mention has no label or id', () => {
		const doc: TiptapDocument = {
			type: 'doc',
			content: [
				{
					type: 'paragraph',
					content: [{ type: 'mention', attrs: {} }]
				}
			]
		};
		expect(extractPlainText(doc)).toBe('@');
	});

	it('should separate multiple blocks with newlines', () => {
		const doc: TiptapDocument = {
			type: 'doc',
			content: [
				{ type: 'paragraph', content: [{ type: 'text', text: 'first' }] },
				{ type: 'paragraph', content: [{ type: 'text', text: 'second' }] }
			]
		};
		expect(extractPlainText(doc)).toBe('first\nsecond');
	});

	it('should preserve empty paragraphs as blank lines', () => {
		const doc: TiptapDocument = {
			type: 'doc',
			content: [
				{ type: 'paragraph', content: [{ type: 'text', text: 'before' }] },
				{ type: 'paragraph' },
				{ type: 'paragraph', content: [{ type: 'text', text: 'after' }] }
			]
		};
		expect(extractPlainText(doc)).toBe('before\n\nafter');
	});

	it('should return newline for hardBreak', () => {
		const doc: TiptapDocument = {
			type: 'doc',
			content: [
				{
					type: 'paragraph',
					content: [
						{ type: 'text', text: 'line1' },
						{ type: 'hardBreak' },
						{ type: 'text', text: 'line2' }
					]
				}
			]
		};
		expect(extractPlainText(doc)).toBe('line1\nline2');
	});

	it('should recurse into block containers with newlines', () => {
		const doc: TiptapDocument = {
			type: 'doc',
			content: [
				{
					type: 'blockquote',
					content: [
						{ type: 'paragraph', content: [{ type: 'text', text: 'quoted1' }] },
						{ type: 'paragraph', content: [{ type: 'text', text: 'quoted2' }] }
					]
				}
			]
		};
		expect(extractPlainText(doc)).toBe('quoted1\nquoted2');
	});

	it('should concatenate inline children without separators', () => {
		const doc: TiptapDocument = {
			type: 'doc',
			content: [
				{
					type: 'paragraph',
					content: [
						{ type: 'text', text: 'hello ' },
						{ type: 'text', text: 'world' }
					]
				}
			]
		};
		expect(extractPlainText(doc)).toBe('hello world');
	});

	it('should recurse into list structures', () => {
		const doc: TiptapDocument = {
			type: 'doc',
			content: [
				{
					type: 'bulletList',
					content: [
						{
							type: 'listItem',
							content: [{ type: 'paragraph', content: [{ type: 'text', text: 'item1' }] }]
						},
						{
							type: 'listItem',
							content: [{ type: 'paragraph', content: [{ type: 'text', text: 'item2' }] }]
						}
					]
				}
			]
		};
		expect(extractPlainText(doc)).toBe('item1\nitem2');
	});
});

describe('extractMentionedUserIds', () => {
	it('should return empty array for null', () => {
		expect(extractMentionedUserIds(null)).toEqual([]);
	});

	it('should return empty array for undefined', () => {
		expect(extractMentionedUserIds(undefined)).toEqual([]);
	});

	it('should return empty array for non-doc type', () => {
		expect(extractMentionedUserIds({ type: 'doc' } as TiptapDocument)).toEqual([]);
	});

	it('should return empty array for doc with no mentions', () => {
		const doc: TiptapDocument = {
			type: 'doc',
			content: [{ type: 'paragraph', content: [{ type: 'text', text: 'no mentions here' }] }]
		};
		expect(extractMentionedUserIds(doc)).toEqual([]);
	});

	it('should extract mention ids', () => {
		const doc: TiptapDocument = {
			type: 'doc',
			content: [
				{
					type: 'paragraph',
					content: [{ type: 'mention', attrs: { id: 'uuid-1', label: 'Alice' } }]
				}
			]
		};
		expect(extractMentionedUserIds(doc)).toEqual(['uuid-1']);
	});

	it('should deduplicate mention ids', () => {
		const doc: TiptapDocument = {
			type: 'doc',
			content: [
				{
					type: 'paragraph',
					content: [
						{ type: 'mention', attrs: { id: 'uuid-1', label: 'Alice' } },
						{ type: 'text', text: ' and ' },
						{ type: 'mention', attrs: { id: 'uuid-1', label: 'Alice' } }
					]
				}
			]
		};
		expect(extractMentionedUserIds(doc)).toEqual(['uuid-1']);
	});

	it('should walk nested structures to find mentions', () => {
		const doc: TiptapDocument = {
			type: 'doc',
			content: [
				{
					type: 'blockquote',
					content: [
						{
							type: 'paragraph',
							content: [{ type: 'mention', attrs: { id: 'uuid-deep', label: 'Bob' } }]
						}
					]
				}
			]
		};
		expect(extractMentionedUserIds(doc)).toEqual(['uuid-deep']);
	});

	it('should extract multiple distinct mention ids', () => {
		const doc: TiptapDocument = {
			type: 'doc',
			content: [
				{
					type: 'paragraph',
					content: [
						{ type: 'mention', attrs: { id: 'uuid-1', label: 'Alice' } },
						{ type: 'text', text: ' and ' },
						{ type: 'mention', attrs: { id: 'uuid-2', label: 'Bob' } }
					]
				}
			]
		};
		const result = extractMentionedUserIds(doc);
		expect(result).toContain('uuid-1');
		expect(result).toContain('uuid-2');
		expect(result).toHaveLength(2);
	});
});

describe('trimTrailingEmptyNodes', () => {
	it('should return doc with empty content array when doc has no content', () => {
		expect(trimTrailingEmptyNodes({ type: 'doc' })).toEqual({ type: 'doc', content: [] });
	});

	it('should return doc with empty content array when doc has empty content array', () => {
		expect(trimTrailingEmptyNodes({ type: 'doc', content: [] })).toEqual({
			type: 'doc',
			content: []
		});
	});

	it('should remove trailing empty paragraphs with no content', () => {
		const doc: TiptapDocument = {
			type: 'doc',
			content: [
				{ type: 'paragraph', content: [{ type: 'text', text: 'hello' }] },
				{ type: 'paragraph' }
			]
		};
		expect(trimTrailingEmptyNodes(doc)).toEqual({
			type: 'doc',
			content: [{ type: 'paragraph', content: [{ type: 'text', text: 'hello' }] }]
		});
	});

	it('should remove trailing empty paragraphs with empty content array', () => {
		const doc: TiptapDocument = {
			type: 'doc',
			content: [
				{ type: 'paragraph', content: [{ type: 'text', text: 'hello' }] },
				{ type: 'paragraph', content: [] }
			]
		};
		expect(trimTrailingEmptyNodes(doc)).toEqual({
			type: 'doc',
			content: [{ type: 'paragraph', content: [{ type: 'text', text: 'hello' }] }]
		});
	});

	it('should remove trailing whitespace-only paragraphs', () => {
		const doc: TiptapDocument = {
			type: 'doc',
			content: [
				{ type: 'paragraph', content: [{ type: 'text', text: 'hello' }] },
				{ type: 'paragraph', content: [{ type: 'text', text: '   ' }] }
			]
		};
		expect(trimTrailingEmptyNodes(doc)).toEqual({
			type: 'doc',
			content: [{ type: 'paragraph', content: [{ type: 'text', text: 'hello' }] }]
		});
	});

	it('should remove trailing paragraphs with only hardBreak', () => {
		const doc: TiptapDocument = {
			type: 'doc',
			content: [
				{ type: 'paragraph', content: [{ type: 'text', text: 'hello' }] },
				{ type: 'paragraph', content: [{ type: 'hardBreak' }] }
			]
		};
		expect(trimTrailingEmptyNodes(doc)).toEqual({
			type: 'doc',
			content: [{ type: 'paragraph', content: [{ type: 'text', text: 'hello' }] }]
		});
	});

	it('should preserve non-trailing empty paragraphs', () => {
		const doc: TiptapDocument = {
			type: 'doc',
			content: [
				{ type: 'paragraph', content: [{ type: 'text', text: 'before' }] },
				{ type: 'paragraph' },
				{ type: 'paragraph', content: [{ type: 'text', text: 'after' }] }
			]
		};
		expect(trimTrailingEmptyNodes(doc)).toEqual({
			type: 'doc',
			content: [
				{ type: 'paragraph', content: [{ type: 'text', text: 'before' }] },
				{ type: 'paragraph' },
				{ type: 'paragraph', content: [{ type: 'text', text: 'after' }] }
			]
		});
	});

	it('should not mutate the original document', () => {
		const doc: TiptapDocument = {
			type: 'doc',
			content: [
				{ type: 'paragraph', content: [{ type: 'text', text: 'hello' }] },
				{ type: 'paragraph' },
				{ type: 'paragraph' }
			]
		};
		const originalContent = [...doc.content!];
		trimTrailingEmptyNodes(doc);
		expect(doc.content).toEqual(originalContent);
		expect(doc.content).toHaveLength(3);
	});

	it('should return doc with empty content when all nodes are empty', () => {
		const doc: TiptapDocument = {
			type: 'doc',
			content: [{ type: 'paragraph' }, { type: 'paragraph', content: [] }, { type: 'paragraph' }]
		};
		expect(trimTrailingEmptyNodes(doc)).toEqual({ type: 'doc', content: [] });
	});
});
