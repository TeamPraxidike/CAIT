<script lang="ts">
	import { authStore } from '$lib';
	import { createEventDispatcher, onMount } from 'svelte';
	import { enhance } from '$app/forms';

	let isFocused = false;
	let originalHeight: string;


	export let addComment: boolean;
	export let commentId = 0;
	export let display = 'flex';

	let userId = $authStore.user?.id || 0;

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
		console.log("cancel form")
		dispatch('addedReply');

	}

	const dispatch = createEventDispatcher();

	/*
	adding this method to test for demo mainly, most likely would be a form with post that happens when you click the comment button
	 */
	function addCommentHandle() {
		isFocused = false;
		textarea.style.height = originalHeight;
		dispatch('addedReply');

	}


	onMount(() => {
		originalHeight = getComputedStyle(textarea).height;
	});

</script>


<div class="{addComment ? 'col-start-1':'col-start-2'} {display} mb-2 gap-2 col-span-full items-center">
	<enhanced:img class="w-10 md:w-14 rounded-full my-4 border" src="/static/fdr.jpg" alt="CAIT Logo" />
	<form method="POST" class="flex-grow" use:enhance={({ formData }) => {
        formData.append('userId',userId.toString());
				formData.append('isComment', addComment.toString());
				formData.append('commentId', commentId.toString());
				 setTimeout(() => {
                     window.location.reload();
                 }, 10);
      }}>
		<div class="flex-grow pt-2 items-center">
        <textarea
					name="comment"
					bind:this={textarea}
					class="w-full border-0 border-b border-surface-300 resize-none overflow-hidden rounded-lg shadow-primary-500 shadow-sm"
					placeholder="{addComment ? 'Start a discussion...' : 'Write a response...'}  "
					rows="1"
					bind:value={commentText}
					on:input={adjustHeight}
					on:focus={handleFocus}
					on:blur={handleBlur}></textarea>
			<div class="flex justify-end mt-2 gap-2">
				<button
					class="variant-soft-surface px-4 py-2 rounded-lg {isFocused ? 'flex' : 'hidden'} hover:variant-filled-surface"
					type="button" on:click={handleCancel}>Cancel
				</button>
				<button
					class="variant-soft-primary px-4 py-2 rounded-lg {isFocused ? 'flex' : 'hidden'} hover:variant-filled-primary mr-2"
					type="submit" formaction="?/comment" on:click={addCommentHandle}>Comment
				</button>
			</div>
		</div>
	</form>
</div>