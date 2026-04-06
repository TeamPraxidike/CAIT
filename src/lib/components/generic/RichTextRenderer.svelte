<!--
	RichTextRenderer.svelte

	A lightweight, read-only renderer for content stored by the RichTextEditor.
	It uses `generateHTML` from `@tiptap/core` to convert stored TipTap JSON
	into an HTML string, sanitizes it with DOMPurify to prevent XSS, then
	renders it via Svelte's `{@html ...}` directive.

	Mention nodes are rendered as clickable chips that link to the mentioned
	user's profile page.

	Usage:
	  <RichTextRenderer content={comment.content} />
-->
<script lang="ts">
	import { generateHTML } from '@tiptap/core';
	import DOMPurify from 'dompurify';
	import { getExtensions } from './tiptapExtensions';

	// ── Props ──────────────────────────────────────────────────────────────

	/** The raw `content` string (JSON-serialised TipTap document). */
	export let content: string = '';

	/** Additional CSS classes applied to the outer wrapper. */
	export let rendererClass = '';

	// ── Setup ─────────────────────────────────────────────────────────────

	/**
	 * Cache the extensions array so it isn't recreated on every reactive
	 * update. No suggestion config is needed for read-only rendering.
	 */
	const extensions = getExtensions();

	/**
	 * DOMPurify configuration. We rely on DOMPurify's sensible defaults for
	 * standard HTML tags and attributes — only the custom data attributes
	 * used by mention chips need to be explicitly allowed.
	 */
	const PURIFY_CONFIG = {
		ADD_ATTR: ['data-type', 'data-id', 'data-username'],
	};

	// ── Derived HTML ──────────────────────────────────────────────────────

	/**
	 * Reactively produce a sanitized HTML string whenever `content` changes.
	 *
	 * Pipeline: JSON string → parse → generateHTML → DOMPurify.sanitize → {@html}
	 */
	$: html = buildHtml(content);

	function buildHtml(raw: string): string {
		if (!raw) return '';

		let parsed: unknown;
		try {
			parsed = JSON.parse(raw);
		} catch {
			console.error('[RichTextRenderer] Content is not valid JSON');
			return '';
		}

		if (!parsed || typeof parsed !== 'object' || (parsed as any).type !== 'doc') {
			console.error('[RichTextRenderer] Content is not a valid TipTap document');
			return '';
		}

		try {
			const unsanitized = generateHTML(parsed as Record<string, any>, extensions);
			return DOMPurify.sanitize(unsanitized, PURIFY_CONFIG);
		} catch (err) {
			console.error('[RichTextRenderer] Failed to generate HTML from content:', err);
			return '';
		}
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
