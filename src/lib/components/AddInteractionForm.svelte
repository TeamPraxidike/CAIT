<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { enhance, applyAction } from '$app/forms';
	import type { User } from '@prisma/client';

	let isFocused = false;
	let originalHeight: string;


	export let addComment: boolean;
	export let commentId = 0;
	export let display = 'flex';
	export let publicationId = 0;
	export let publisher: User & { profilePicData: string };

	let userId = publisher.id || 0;

	let text = addComment ? 'Comment' : 'Reply';
	let commentText = '';
	let textarea: HTMLTextAreaElement;

	function adjustHeight() {
		textarea.style.height = 'auto';
		textarea.style.height = textarea.scrollHeight + 'px';
	}

	function handleFocus() {
		isFocused = true;
	}

	function handleBlur() {
		if (commentText === '') {
			isFocused = false;
		}
	}

	function handleCancel() {
		commentText = '';
		isFocused = false;
		textarea.style.height = originalHeight;
		dispatch('cancelEventForum');

	}

	const dispatch = createEventDispatcher();

	/*
		dispatch an event with info needed to create a placeholder comment and save comment in the database
	 */
	function addCommentHandle(content: any) {
		dispatch('addedReply', { content: content });

		commentText = '';
		isFocused = false;
		textarea.style.height = originalHeight;
	}

	onMount(() => {
		originalHeight = getComputedStyle(textarea).height;
	})
	;

	const defaultProfilePicturePath = "/static/defaultProfilePic/profile.jpg"

</script>


<div class="{addComment ? 'col-start-1':'col-start-2'} {display} mb-2 gap-2 col-span-full items-top">
	<img class="w-10 h-10 md:w-14 md:h-14 rounded-full border"
		 src={publisher.profilePicData ? `data:image;base64,${publisher.profilePicData}` : defaultProfilePicturePath}
		 alt="CAIT Logo" />
	<form method="POST" class="flex-grow" use:enhance={({ formData }) => {
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
			<textarea
				name="comment"
				bind:this={textarea}
				class="w-full border-0 border-surface-300 resize-none overflow-hidden rounded-lg shadow-primary-500 shadow-sm dark:text-surface-800 ring-0
				 focus:border-b focus:border-primary-500 focus:ring-0 my-2"
				placeholder="{addComment ? 'Start a discussion...' : 'Write a response...'}  "
				rows="1"
				bind:value={commentText}
				on:input={adjustHeight}
				on:focus={handleFocus}
				on:blur={handleBlur}></textarea>

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