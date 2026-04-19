<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { enhance, applyAction } from '$app/forms';
	import type { User } from '@prisma/client';
	import { RichTextEditor } from '$lib';
	import { mentionSuggestion } from '$lib/components/generic/mentionSuggestion';
	import { trimTrailingEmptyNodes, type TiptapDocument } from '$lib/util/content';

	let isFocused = false;

	function getEditorContent(): string {
		const raw = editorRef?.getJSON();
		const trimmed = raw ? trimTrailingEmptyNodes(raw as TiptapDocument) : { type: 'doc', content: [] };
		return JSON.stringify(trimmed);
	}

	export let addComment: boolean;
	export let commentId = 0;
	export let display = 'flex';
	export let publicationId = 0;
	export let publisher: User & { profilePicData: string };

	let userId = publisher.id || 0;

	let text = addComment ? 'Comment' : 'Reply';
	let editorRef: RichTextEditor;
	let isEmpty = true;

	function handleFocus() {
		isFocused = true;
	}

	function handleBlur() {
		if (isEmpty) {
			isFocused = false;
		}
	}

	function handleCancel() {
		editorRef?.clearContent();
		isEmpty = true;
		isFocused = false;
		dispatch('cancelEventForum');
	}

	const dispatch = createEventDispatcher();

	/*
		dispatch an event with info needed to create a placeholder comment and save comment in the database
	 */
	function addCommentHandle(content: any) {
		dispatch('addedReply', { content: content });

		editorRef?.clearContent();
		isEmpty = true;
		isFocused = false;
	}

	const defaultProfilePicturePath = "/defaultProfilePic/profile.jpg"

</script>


<div class="{addComment ? 'col-start-1':'col-start-2'} {display} mb-2 gap-2 col-span-full items-top">
	<img class="w-10 h-10 md:w-14 md:h-14 rounded-full border"
		 src={publisher.profilePicData ? publisher.profilePicData : defaultProfilePicturePath}
		 alt="CAIT Logo" />
	<form method="POST" class="flex-grow" use:enhance={({ formData }) => {
        formData.set('comment', getEditorContent());
        formData.append('userId',userId.toString());
				formData.append('isComment', addComment.toString());
				formData.append('commentId', commentId.toString());
				formData.append('publicationId', publicationId.toString());

				return async ({ result}) => {
					// `result` is an `ActionResult` object
						if (result.type === 'success') {
							let content = result.data?.content;
							//console.log(typeof content)
							addCommentHandle(content);
						} else {
							alert('Failed to submit form')
							await applyAction(result);
						}
				};
      }}>
			<RichTextEditor
				bind:this={editorRef}
				placeholder={addComment ? 'Start a discussion...' : 'Write a response...'}
				{mentionSuggestion}
				editorClass="my-2 shadow-primary-500 shadow-sm"
				on:update={(e) => { isEmpty = e.detail.isEmpty; }}
				on:focus={handleFocus}
				on:blur={handleBlur}
			/>

		<div class="flex justify-end mt-2 gap-2 {isFocused ? 'flex' : 'hidden'}">
			<button
				class="variant-soft-surface px-4 py-2 rounded-lg  hover:variant-filled-surface"
				type="button" on:click={handleCancel}>Cancel
			</button>
			<button
				class="variant-soft-primary px-4 py-2 rounded-lg  hover:variant-filled-primary mr-2"
				type="submit" formaction="?/comment"> {text}
			</button>
		</div>
	</form>
</div>
