<!--
	RichTextRenderer.svelte

	A lightweight, read-only renderer for content stored by the RichTextEditor.
	Instead of mounting a full TipTap editor instance, it uses `generateHTML`
	from `@tiptap/core` to convert stored TipTap JSON into an HTML string,
	which is then rendered via Svelte's `{@html ...}` directive.

	For legacy plain-text content (created before the rich text editor was
	introduced), it falls back to simple HTML-escaped text wrapped in a `<p>`.

	Mention nodes are rendered as clickable chips that link to the mentioned
	user's profile page.

	Usage:
	  <RichTextRenderer content={comment.content} />
-->
<script lang="ts">
	import { generateHTML } from '@tiptap/core';
	import { getExtensions } from './tiptapExtensions';
	import { parseContent, escapeHtml } from '$lib/util/content';

	// ── Props ──────────────────────────────────────────────────────────────

	/** The raw `content` string */
	export let content: string = '';

	/** Additional CSS classes applied to the outer wrapper. */
	export let rendererClass = '';

	// ── Derived HTML ──────────────────────────────────────────────────────

	/**
	 * Cache the extensions array so it isn't recreated on every reactive
	 * update.  No suggestion config is needed for read-only rendering.
	 */
	const extensions = getExtensions();

	/**
	 * Reactively produce an HTML string whenever `content` changes.
	 *
	 * - TipTap JSON content is rendered through `generateHTML` so that
	 *   mention chips (and all other node types) are faithfully reproduced.
	 * - Legacy plain-text content is escaped and wrapped in `<p>` tags,
	 *   preserving line breaks as separate paragraphs.
	 */
	$: html = buildHtml(content);

	function buildHtml(raw: string): string {
		if (!raw) return '';

		const parsed = parseContent(raw);

		if (parsed.kind === 'json') {
			try {
				return generateHTML(parsed.data, extensions);
			} catch (err) {
				// If the JSON is somehow malformed, fall back to plain text
				// rather than crashing the UI.
				console.error('[RichTextRenderer] Failed to generate HTML from JSON content:', err);
				return plainTextToHtml(raw);
			}
		}

		return plainTextToHtml(parsed.data);
	}

	/**
	 * Converts a plain-text string to simple HTML, splitting on newlines
	 * and wrapping each line in a `<p>`.
	 */
	function plainTextToHtml(text: string): string {
		if (!text) return '';
		return text
			.split('\n')
			.map((line) => `<p>${escapeHtml(line) || '<br>'}</p>`)
			.join('');
	}
</script>

<div
    class="
        prose prose-sm dark:prose-invert max-w-none w-full {rendererClass}

        /** -- Pure Tailwind Mention Chip Styling -- */
        [&_.mention-chip]:inline-flex
        [&_.mention-chip]:items-center
        [&_.mention-chip]:px-2
        [&_.mention-chip]:py-0.5
        [&_.mention-chip]:rounded-full
        [&_.mention-chip]:bg-primary-500/15
        [&_.mention-chip]:text-primary-700
        dark:[&_.mention-chip]:text-primary-300
        [&_.mention-chip]:font-medium
        [&_.mention-chip]:text-sm
        [&_.mention-chip]:no-underline
        [&_.mention-chip]:cursor-pointer
        [&_.mention-chip]:transition-colors
        hover:[&_.mention-chip]:bg-primary-500/25
    "
>
    {@html html}
</div>
