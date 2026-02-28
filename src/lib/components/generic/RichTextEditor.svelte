<!--
	RichTextEditor.svelte

	A Svelte wrapper around the TipTap rich text editor.  It initialises a
	TipTap `Editor` instance, mounts it into a bound `<div>`, and exposes a
	small public API that parent components can call via `bind:this`.

	The editor is configured with StarterKit (basic formatting) and the Mention
	extension.  An optional `mentionSuggestion` prop allows the parent to inject
	a full suggestion configuration (dropdown, search, etc.).

	Usage:
	  <RichTextEditor
	    bind:this={editorRef}
	    placeholder="Start a discussion…"
	    on:update={handleUpdate}
	    on:focus={handleFocus}
	    on:blur={handleBlur}
	  />

	  // In the parent, on submit:
	  const json = editorRef.getJSON();
	  editorRef.clearContent();
-->
<script lang="ts">
	import { onMount, onDestroy, createEventDispatcher } from 'svelte';
	import { Editor } from '@tiptap/core';
	import { getExtensions, type MentionSuggestionConfig } from './tiptapExtensions';

	// ── Props ──────────────────────────────────────────────────────────────

	/** Placeholder text shown when the editor is empty. */
	export let placeholder = '';

	/**
	 * Initial content for the editor.
	 * Accepts a JSON-serialised TipTap document string **or** plain text.
	 * Changing this prop after mount will call `editor.commands.setContent`.
	 */
	export let content: string = '';

	/** Whether the editor is editable. */
	export let editable = true;

	/** Additional CSS classes applied to the outer container. */
	export let editorClass = '';

	/**
	 * Optional mention suggestion configuration. When provided the Mention
	 * extension will enable its suggestion dropdown. When omitted the Mention node is still registered in the
	 * schema so stored mentions render correctly.
	 */
	export let mentionSuggestion: MentionSuggestionConfig | undefined = undefined;

	// ── Internal state ────────────────────────────────────────────────────

	let element: HTMLDivElement;
	let editor: Editor | null = null;
	let editorIsEmpty = true;

	const dispatch = createEventDispatcher<{
		update: { json: ReturnType<Editor['getJSON']>; html: string; text: string; isEmpty: boolean };
		focus: void;
		blur: void;
	}>();

	// ── Helpers ────────────────────────────────────────────────────────────

	/**
	 * Interprets the raw `content` prop into a value the TipTap `Editor`
	 * constructor / `setContent` command understands.
	 */
	function parseInitialContent(raw: string): ReturnType<Editor['getJSON']> | string {
		if (!raw) return '';
		try {
			const parsed = JSON.parse(raw);
			if (parsed && typeof parsed === 'object' && parsed.type === 'doc') {
				return parsed;
			}
		} catch {
			// Not JSON – treat as plain text / HTML. TipTap handles both.
		}
		return raw;
	}

	// ── Lifecycle ──────────────────────────────────────────────────────────

	onMount(() => {
		editor = new Editor({
			element: { mount: element },
			extensions: getExtensions(placeholder, mentionSuggestion),
			content: parseInitialContent(content),
			editable,
			editorProps: {
				attributes: {
					class: 'tiptap-editor',
				},
			},
			onCreate: ({ editor: e }) => {
				editorIsEmpty = e.isEmpty;
			},
			onUpdate: ({ editor: e }) => {
				editorIsEmpty = e.isEmpty;
				dispatch('update', {
					json: e.getJSON(),
					html: e.getHTML(),
					text: e.getText(),
					isEmpty: e.isEmpty,
				});
			},
			onFocus: () => dispatch('focus'),
			onBlur: () => dispatch('blur'),
		});
	});

	onDestroy(() => {
		editor?.destroy();
		editor = null;
	});

	// React to external `content` prop changes after initial mount.
	$: if (editor && content !== undefined) {
		const incoming = parseInitialContent(content);
		// Avoid a feedback loop: only push when the value genuinely changed.
		const currentJSON = JSON.stringify(editor.getJSON());
		const incomingJSON = typeof incoming === 'string' ? null : JSON.stringify(incoming);
		if (incomingJSON !== null && incomingJSON !== currentJSON) {
			editor.commands.setContent(incoming);
			editorIsEmpty = editor.isEmpty;
		}
	}

	// React to external `editable` prop changes.
	$: if (editor) {
		editor.setEditable(editable);
	}

	// ── Public API (accessed via bind:this) ────────────────────────────────

	/** Returns the document as a TipTap JSON object. */
	export function getJSON() {
		return editor?.getJSON() ?? null;
	}

	/** Returns the document serialised as an HTML string. */
	export function getHTML(): string {
		return editor?.getHTML() ?? '';
	}

	/** Returns a plain-text representation of the document. */
	export function getText(): string {
		return editor?.getText() ?? '';
	}

	/** Clears all content from the editor. */
	export function clearContent(): void {
		editor?.commands.clearContent();
		editorIsEmpty = true;
	}

	/** Whether the editor currently has no meaningful content. */
	export function getIsEmpty(): boolean {
		return editor?.isEmpty ?? true;
	}

	/** Focuses the editor. */
	export function focus(): void {
		editor?.commands.focus();
	}

	/** Returns the underlying TipTap `Editor` instance. */
	export function getEditor(): Editor | null {
		return editor;
	}
</script>

<div class="textarea p-0 relative {editorClass}">
    <div
        bind:this={element}
        class="
            editor-content prose prose-sm dark:prose-invert max-w-none w-full p-3

            /* -- Pure Tailwind Placeholder Styling -- */
            [&_p.is-editor-empty::before]:content-[attr(data-placeholder)]
            [&_p.is-editor-empty::before]:text-surface-400
            [&_p.is-editor-empty::before]:float-left
            [&_p.is-editor-empty::before]:h-0
            [&_p.is-editor-empty::before]:pointer-events-none
        "
    ></div>
</div>
