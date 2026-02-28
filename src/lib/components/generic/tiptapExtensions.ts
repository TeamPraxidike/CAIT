import StarterKit from '@tiptap/starter-kit';
import Mention from '@tiptap/extension-mention';
import Placeholder from '@tiptap/extension-placeholder';
import type { SuggestionOptions } from '@tiptap/suggestion';
import type { MentionNodeAttrs } from '@tiptap/extension-mention';

/**
 * Represents a user item returned by the mention suggestion search.
 * Used as the generic type for the suggestion dropdown items.
 */
export interface MentionUser {
	id: string;
	username: string;
	firstName: string;
	lastName: string;
	profilePicData?: string;
}

/**
 * The type for an external mention suggestion configuration.
 * Omits `editor` since TipTap injects that automatically.
 */
export type MentionSuggestionConfig = Partial<
	Omit<SuggestionOptions<MentionUser, MentionNodeAttrs>, 'editor'>
>;

/**
 * Creates the shared TipTap extensions array used by both the editor and the renderer.
 *
 * @param mentionSuggestionConfig - Optional suggestion configuration for the Mention extension.
 *   When provided (in the editor), it enables the suggestion dropdown for @mentions.
 *   When omitted (in the renderer), the Mention node is still registered in the schema
 *   so that `generateHTML` can render mention nodes correctly.
 */
export function getExtensions(
	placeholder?: string,
	mentionSuggestionConfig?: MentionSuggestionConfig,
) {
	return [
		StarterKit,
		Placeholder.configure({
			placeholder: placeholder || 'Enter text here...',
		}),
		Mention.configure({
			HTMLAttributes: {
				class: 'mention-chip',
			},
			renderText({ node }) {
				return `@${node.attrs.label ?? node.attrs.id}`;
			},
			renderHTML({ node }) {
				// `id` stores the user's UUID for data integrity.
				// `label` stores the user's username, which is used both as the
				// display text ("@username") and to construct the profile link
				// (`/username`). This matches the `[user]` route pattern.
				const username = node.attrs.label ?? node.attrs.id;

				return [
					'a',
					{
						class: 'mention-chip',
						'data-type': 'mention',
						'data-id': node.attrs.id,
						'data-username': username,
						href: `/${username}`,
					},
					`@${username}`,
				];
			},
			...(mentionSuggestionConfig
				? { suggestion: mentionSuggestionConfig }
				: {}),
		}),
	];
}
