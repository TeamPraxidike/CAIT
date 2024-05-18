<script lang="ts">
	import { DifficultySelection, FileTable, authStore, Meta, Render, Tag } from '$lib';
	import { FileDropzone } from '@skeletonlabs/skeleton';
	import { fade } from 'svelte/transition';
	import type { ActionData } from './$types';

	let tags: string[] = [];

	let files: FileList;
	let activeFile: File;

	let LOs: string[] = [];
	let loInput: HTMLInputElement;
	let tagInput: HTMLInputElement;
	let leftHeight: number;

	$:uid = $authStore.user?.id || 0;

	// eslint-disable-next-line svelte/valid-compile
	export let form: ActionData;
</script>

<Meta title="Publish" description="CAIT" type="site" />

{#if form?.status === 200}
	<p class="col-span-full p-4 variant-soft-success">Successfully submitted!</p>
{:else if form?.status === 400}
	<p class="col-span-full p-4 variant-soft-error">Error: {form.message}</p>
{/if}

<h2 class="col-span-full mt-40 text-lg md:text-xl lg:text-2xl xl:text-3xl font-semibold">Publish a publication</h2>
<form method="POST"
	  enctype="multipart/form-data"
	  action="?/publish"
	  class="col-span-full items-start mb-40
			 lg:grid lg:gap-4 lg:grid-cols-2">

	<div class="flex flex-col gap-2">
		<input class="hidden" type="number" name="userId" bind:value={uid}>
		<input type="text" name="title" placeholder="Title"
			   class="rounded-lg dark:bg-surface-800 bg-surface-50 w-full text-surface-700 dark:text-surface-400">
		<textarea name="description" placeholder="Description..."
				  class="rounded-lg h-40 resize-y dark:bg-surface-800 bg-surface-50 w-full text-surface-700 dark:text-surface-400" />

		<label for="description">Difficulty:</label>
		<DifficultySelection difficulty="easy" />
	</div>

	<div>
		<label for="learning_objective_input">Learning Objectives:</label>
		<div class="flex gap-2">
			<input type="text" name="learning_objective_input" id="learning_objective_input" bind:this={loInput}
				   class="rounded-lg dark:bg-surface-800 bg-surface-50 text-surface-700 dark:text-surface-400">
			<button type="button" name="add_lo" on:click={() => { LOs = [...LOs, loInput.value]; loInput.value = ""}}
					class="btn bg-surface-700 text-surface-50 rounded-lg hover:bg-opacity-85">+
			</button>
		</div>
		<ol class="list-decimal bg-surface-100 list-inside gap-2 max-h-40 overflow-y-auto">
			{#each LOs as LO}
				<li transition:fade={{duration: 200}}>{LO}</li>
			{/each}
		</ol>

		<label for="tags_input">Tags:</label>
		<div class="flex gap-2">
			<input type="text" name="tags_input" id="tags_input" bind:this={tagInput}
				   class="rounded-lg dark:bg-surface-800 bg-surface-50 text-surface-700 dark:text-surface-400">
			<button type="button" name="add_tag"
					on:click={() => { tags = [...tags, tagInput.value]; tagInput.value = ""}}
					class="btn bg-surface-700 text-surface-50 rounded-lg hover:bg-opacity-85">+</button>
		</div>

		<div class="flex flex-wrap gap-2">
			{#each tags as tag}
				<Tag tagText={tag} removable={false} />
			{/each}
		</div>

		<div class="flex gap-2">
			<div class="w-1/2">
				<label for="estimate">Time Estimate:</label>
				<input type="text" name="estimate"
					   class="rounded-lg dark:bg-surface-800 bg-surface-50 w-full text-surface-700 dark:text-surface-400">
			</div>
			<div class="w-1/2">
				<label for="copyright">Copyright:</label>
				<input type="text" name="copyright"
					   class="rounded-lg dark:bg-surface-800 bg-surface-50 w-full text-surface-700 dark:text-surface-400">
			</div>
		</div>
	</div>

	<hr class="col-span-2 my-4">

	<div bind:clientHeight={leftHeight} class="flex flex-col gap-4">
		<FileDropzone multiple name="file" bind:files={files} />
		<FileTable download={true} {files} bind:activeFile={activeFile} />
		<button type="submit" class="btn rounded-lg variant-filled-primary text-surface-50">Publish</button>
	</div>
	<Render height={leftHeight} {activeFile} />
</form>