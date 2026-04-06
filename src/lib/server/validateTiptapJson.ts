import { getSchema } from '@tiptap/core';
import { getExtensions } from '$lib/components/generic/tiptapExtensions';

/**
 * ProseMirror schema derived from the same TipTap extensions used by the
 * editor and renderer. `schema.nodeFromJSON` will throw if the JSON contains
 * node types not defined in the schema, giving us structural validation.
 *
 * The schema is built once at module load time and reused across requests.
 */
const schema = getSchema(getExtensions());

/**
 * Validates that an unknown value is a structurally valid TipTap/ProseMirror
 * JSON document according to the application's registered extensions.
 *
 * Uses ProseMirror's own `schema.nodeFromJSON` which:
 * - Rejects unknown node types (throws `Unknown node type: X`)
 * - Silently drops unknown attributes on known nodes
 * - Enforces the content rules defined in each node spec
 *
 * This is a defense-in-depth measure at the API boundary. The real XSS
 * security boundary is DOMPurify on the client side before `{@html}` renders.
 *
 * @param json - The untrusted value from the request body (e.g. `body.content`).
 * @returns `{ valid: true }` if the document is structurally sound, or
 *   `{ valid: false, error: string }` with a human-readable reason.
 *
 * @example
 * ```ts
 * const result = validateTiptapJson(body.content);
 * if (!result.valid) {
 *     return new Response(JSON.stringify({ error: result.error }), { status: 400 });
 * }
 * ```
 */
export function validateTiptapJson(
	json: unknown,
): { valid: true } | { valid: false; error: string } {
	if (json === null || json === undefined) {
		return { valid: false, error: 'Content is required' };
	}

	if (typeof json !== 'object' || Array.isArray(json)) {
		return { valid: false, error: 'Content must be a JSON object' };
	}

	const doc = json as Record<string, unknown>;

	if (doc.type !== 'doc') {
		return {
			valid: false,
			error: `Expected top-level type "doc", got "${String(doc.type)}"`,
		};
	}

	try {
		schema.nodeFromJSON(json);
		return { valid: true };
	} catch (e: unknown) {
		const message =
			e instanceof Error ? e.message : 'Invalid TipTap content';
		return { valid: false, error: message };
	}
}

/**
 * Validates an optional TipTap JSON value, such as `PublicationHistory.comment`
 * which is `Json?` in the schema.
 *
 * - `null`, `undefined`, and empty string `""` are treated as valid (no content).
 * - Anything else is validated through {@link validateTiptapJson}.
 *
 * @param json - The untrusted value from the request body.
 */
export function validateOptionalTiptapJson(
	json: unknown,
): { valid: true } | { valid: false; error: string } {
	if (json === null || json === undefined || json === '') {
		return { valid: true };
	}

	return validateTiptapJson(json);
}
