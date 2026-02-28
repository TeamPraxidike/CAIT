/**
 * Utilities for parsing and working with rich text content stored in the database.
 *
 * Comments and replies store their `content` field as a plain string. Historically
 * this was raw plain text. With the introduction of the TipTap rich text editor,
 * new content is stored as a JSON-serialised TipTap document. These helpers let
 * the application transparently handle both formats so that legacy plain-text
 * comments continue to render correctly alongside new rich-text ones.
 */

/**
 * The shape of a TipTap JSON document at the top level.
 */
export interface TiptapDocument {
	type: 'doc';
	content: TiptapNode[];
}

/**
 * A single node inside a TipTap JSON document tree.
 */
export interface TiptapNode {
	type: string;
	attrs?: Record<string, unknown>;
	content?: TiptapNode[];
	text?: string;
}

/**
 * Discriminated result of {@link parseContent}.
 */
export type ParsedContent =
	| { kind: 'json'; data: TiptapDocument }
	| { kind: 'text'; data: string };

/**
 * Attempts to interpret a raw content string as TipTap JSON.
 *
 * - If the string is valid JSON whose top-level `type` is `"doc"`, it is
 *   returned as a structured {@link TiptapDocument}.
 * - Otherwise the string is treated as legacy plain text.
 *
 * This function never throws.
 *
 * @param raw - The raw `content` value from a Comment or Reply record.
 * @returns A discriminated union indicating the detected format.
 */
export function parseContent(raw: string): ParsedContent {
	if (!raw) {
		return { kind: 'text', data: '' };
	}

	try {
		const parsed = JSON.parse(raw);
		if (parsed && typeof parsed === 'object' && parsed.type === 'doc') {
			return { kind: 'json', data: parsed as TiptapDocument };
		}
	} catch {
		// Not valid JSON – fall through to plain-text path.
	}

	return { kind: 'text', data: raw };
}

/**
 * Returns the TipTap-compatible `content` value that can be passed directly to
 * the TipTap `Editor` constructor or to `generateHTML`.
 *
 * - For JSON content it returns the parsed object.
 * - For plain text it returns the raw string (TipTap accepts HTML/text strings
 *   as initial content and will wrap them in a paragraph automatically).
 *
 * @param raw - The raw `content` value from the database.
 */
export function toEditorContent(raw: string): TiptapDocument | string {
	const parsed = parseContent(raw);
	return parsed.kind === 'json' ? parsed.data : parsed.data;
}

/**
 * Extracts a plain-text representation from a raw content string, regardless
 * of whether it is legacy plain text or TipTap JSON.
 *
 * Mention nodes are serialised as `@label`.
 *
 * @param raw - The raw `content` value from the database.
 * @returns A human-readable plain-text string.
 */
export function extractPlainText(raw: string): string {
	const parsed = parseContent(raw);
	if (parsed.kind === 'text') {
		return parsed.data;
	}
	return walkTextNodes(parsed.data);
}

/**
 * Recursively walks a TipTap node tree and concatenates all text content.
 */
function walkTextNodes(node: TiptapNode): string {
	if (node.type === 'text') {
		return node.text ?? '';
	}

	if (node.type === 'mention') {
		const label =
			(node.attrs?.label as string) ?? (node.attrs?.id as string) ?? '';
		return `@${label}`;
	}

	if (!node.content || node.content.length === 0) {
		return '';
	}

	const childText = node.content.map(walkTextNodes).join('');

	// Insert line breaks between block-level nodes (paragraphs, headings, etc.)
	if (node.type === 'doc') {
		return node.content.map(walkTextNodes).join('\n');
	}

	return childText;
}

/**
 * Extracts the unique user IDs of all `@mention` nodes found in a raw content
 * string.
 *
 *
 * @param raw - The raw `content` value from the database.
 * @returns An array of unique user ID strings (UUIDs). Returns an empty array
 *   for legacy plain-text content.
 */
export function extractMentionedUserIds(raw: string): string[] {
	const parsed = parseContent(raw);
	if (parsed.kind === 'text') {
		return [];
	}

	const ids: string[] = [];

	function walk(node: TiptapNode): void {
		if (node.type === 'mention' && node.attrs?.id) {
			ids.push(node.attrs.id as string);
		}
		if (node.content) {
			node.content.forEach(walk);
		}
	}

	walk(parsed.data);
	return [...new Set(ids)];
}

/**
 * Escapes a plain-text string so it can be safely interpolated into HTML via
 * `{@html ...}`.
 *
 * @param text - The raw text to escape.
 * @returns The escaped string with `&`, `<`, `>`, `"` and `'` replaced by
 *   their HTML entity equivalents.
 */
export function escapeHtml(text: string): string {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}
