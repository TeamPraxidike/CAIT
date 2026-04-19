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
export type TiptapDocument = {
	type: 'doc';
	content?: TiptapNode[];
};

/**
 * A single node inside a TipTap JSON document tree.
 */
export type TiptapNode = {
	type: string;
	attrs?: Record<string, unknown>;
	content?: TiptapNode[];
	text?: string;
	marks?: { type: string; attrs?: Record<string, unknown> }[];
};

// ── Plain-text extraction ─────────────────────────────────────────────

/**
 * Extracts a plain-text representation from a TipTap JSON document.
 *
 * Mention nodes are serialised as `@label`. Block-level children of the root
 * document are separated by newlines. Empty paragraphs are preserved as blank
 * lines so that intentional vertical whitespace survives the conversion
 * (e.g. when pasting a copied comment into a plain-text context).
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
	if (!doc.content || doc.content.length === 0) {
		return '';
	}
	return doc.content.map(blockToPlainText).join('\n');
}

/**
 * Converts a single block-level node (paragraph, heading, etc.) to plain text.
 * Empty paragraphs produce an empty string so that `join('\n')` at the doc
 * level preserves blank lines.
 */
function blockToPlainText(node: TiptapNode): string {
	if (node.type === 'text') {
		return node.text ?? '';
	}

	if (node.type === 'mention') {
		const label =
			(node.attrs?.label as string) ?? (node.attrs?.id as string) ?? '';
		return `@${label}`;
	}

	// A node with no children (e.g. an empty paragraph, a hardBreak, an
	// horizontal rule) — return empty so the caller's `join('\n')` inserts
	// a blank line.
	if (!node.content || node.content.length === 0) {
		// hardBreak is an inline node that represents a <br>
		if (node.type === 'hardBreak') {
			return '\n';
		}
		return '';
	}

	// For block-level containers that themselves hold blocks (e.g.
	// blockquote, listItem) recurse with newline separators.
	const isBlockContainer = [
		'blockquote',
		'listItem',
		'bulletList',
		'orderedList',
	].includes(node.type);

	if (isBlockContainer) {
		return node.content.map(blockToPlainText).join('\n');
	}

	// Inline container (paragraph, heading, etc.) — concatenate children
	// without extra separators.
	return node.content.map(blockToPlainText).join('');
}

// ── Mention extraction ────────────────────────────────────────────────

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

// ── Trailing whitespace trimming ──────────────────────────────────────

/**
 * Returns whether a TipTap node is "empty" — i.e. it carries no meaningful

 * text or inline content.  An empty paragraph is `{ type: 'paragraph' }` or
 * `{ type: 'paragraph', content: [] }`.  A paragraph containing only
 * whitespace text nodes is also considered empty.
 */
function isEmptyBlock(node: TiptapNode): boolean {
	if (!node.content || node.content.length === 0) {
		return true;
	}

	// A block whose only children are whitespace-only text nodes
	return node.content.every((child) => {
		if (child.type === 'text') {
			return !(child.text ?? '').trim();
		}
		// hardBreak on its own counts as empty
		if (child.type === 'hardBreak') {
			return true;
		}
		return false;
	});
}

/**
 * Returns a **new** TipTap document with trailing empty paragraphs removed.
 *
 * TipTap always maintains at least one paragraph node in the editor, so users
 * pressing Enter at the end of a comment accumulate empty `<p>` nodes that
 * add meaningless whitespace when the content is rendered.  This function
 * clones the document, walks backward from the end, and pops off any empty
 * trailing block nodes.
 *
 * If *every* block is empty the function returns a minimal empty document
 * (`{ type: 'doc', content: [] }`) rather than stripping all content —
 * callers can then use `editor.getIsEmpty()` or check `content.length === 0`
 * to decide whether to persist the document at all.
 *
 * This is a **pure function** — it never mutates the input.
 *
 * @param doc - The TipTap document to trim.
 * @returns A shallow-cloned document with trailing empties removed.
 */
export function trimTrailingEmptyNodes(doc: TiptapDocument): TiptapDocument {
	if (!doc.content || doc.content.length === 0) {
		return { type: 'doc', content: [] };
	}

	// Clone the content array so we don't mutate the original
	const trimmed = [...doc.content];

	while (trimmed.length > 0 && isEmptyBlock(trimmed[trimmed.length - 1])) {
		trimmed.pop();
	}

	return { type: 'doc', content: trimmed };
}
