/**
 * Utilities for working with rich text content stored in the database.
 *
 * Comments, replies, and publication history entries store their content as
 * TipTap JSON (a ProseMirror document tree). Because these columns use
 * Prisma's `Json` type, reads return an already-parsed JavaScript object — no
 * `JSON.parse` step is required in application code.
 *
 * These helpers provide typed walks over that structure for common tasks
 * such as extracting plain text or collecting mentioned user IDs (e.g. for
 * notification fan-out).
 */

/**
 * The shape of a TipTap JSON document at the top level.
 */
export interface TiptapDocument {
	type: 'doc';
	content?: TiptapNode[];
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
 * Extracts a plain-text representation from a TipTap JSON document.
 *
 * Mention nodes are serialised as `@label`. Block-level children of the root
 * document are separated by newlines so that multi-paragraph content remains
 * readable when rendered as plain text (e.g. in clipboard copies).
 *
 * @param doc - A parsed TipTap document, typically read straight from a
 *   Prisma `Json` column.
 * @returns A human-readable plain-text string. Returns an empty string if the
 *   document is nullish or malformed.
 */
export function extractPlainText(
	doc: TiptapDocument | null | undefined,
): string {
	if (!doc || doc.type !== 'doc') {
		return '';
	}
	return walkTextNodes(doc);
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

	// Insert line breaks between block-level children of the document root
	// so multi-paragraph content stays readable as plain text.
	if (node.type === 'doc') {
		return node.content.map(walkTextNodes).join('\n');
	}

	return node.content.map(walkTextNodes).join('');
}

/**
 * Extracts the unique user IDs of all `@mention` nodes found in a TipTap
 * document.
 *
 * @param doc - A parsed TipTap document, typically read straight from a
 *   Prisma `Json` column.
 * @returns An array of unique user ID strings (UUIDs). Returns an empty array
 *   if the document is nullish or contains no mentions.
 */
export function extractMentionedUserIds(
	doc: TiptapDocument | null | undefined,
): string[] {
	if (!doc || doc.type !== 'doc') {
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

	walk(doc);
	return [...new Set(ids)];
}
