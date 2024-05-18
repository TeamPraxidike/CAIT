<script lang="ts">
	import { DifficultySelection, FileTable, authStore, Meta, Tag } from '$lib';
	import { FileDropzone, Stepper, Step } from '@skeletonlabs/skeleton';
	import { fade } from 'svelte/transition';

	import { enhance } from '$app/forms';

	import type { ActionData } from './$types';
	import type { Difficulty } from '@prisma/client';

	let tags: string[] = [];
	let maintainers: string[] = [];
	let files: FileList;

	let title: string = '';
	let description: string = '';
	let difficulty: Difficulty = 'easy';
	let estimate: string = '';
	let copyright: string = '';


	let LOs: string[] = [];
	let loInput: HTMLInputElement;
	let tagInput: HTMLInputElement;
	let maintainersInput: HTMLInputElement;
	$:uid = $authStore.user?.id || 0;

	// eslint-disable-next-line svelte/valid-compile
	export let form: ActionData;
</script>

<Meta title="Publish" description="CAIT" type="site" />

{#if form?.status === 200}
	<p class="absolute col-span-full p-4 variant-soft-success">Successfully submitted!</p>
{:else if form?.status === 400}
	<p class="absolute col-span-full p-4 variant-soft-error">Error: {form.message}</p>
{/if}

<form method="POST"
	  enctype="multipart/form-data"
	  action="?/publish"
	  class="col-start-2 col-span-10 my-20 pr-10 shadow p-4"
	  use:enhance={({formData}) => {
		  Array.from(files).forEach(file => {
			if (file.size > 1024*1024*100) {
			   alert('File size exceeds 100MB')
			} else {
			   formData.append('file', file)
			}
		  });

		  formData.append('userId', uid.toString());
		  formData.append('title', title);
		  formData.append('description', description);
		  formData.append('difficulty', difficulty);
		  formData.append('estimate', estimate);
		  formData.append('copyright', copyright);
		  formData.append('tags', tags.join(';'));
		  formData.append('maintainers', uid.toString());
		  formData.append('learning_objectives', LOs.join(';'));
	  }}>
	<Stepper buttonCompleteType="submit">
		<Step>
			<svelte:fragment slot="header">Upload files</svelte:fragment>
			<FileDropzone multiple name="file" bind:files={files} />
			<FileTable download={false} {files} />
		</Step>
		<Step>
			<svelte:fragment slot="header">Give your publication a title</svelte:fragment>
			<div class="flex flex-col gap-2">
				<input type="text" name="title" placeholder="Title" bind:value={title}
					   class="rounded-lg dark:bg-surface-800 bg-surface-50 w-full text-surface-700 dark:text-surface-400">
				<textarea name="description" placeholder="Description..." bind:value={description}
						  class="rounded-lg h-40 resize-y dark:bg-surface-800 bg-surface-50 w-full text-surface-700 dark:text-surface-400" />
			</div>
		</Step>
		<Step>
			<svelte:fragment slot="header">Fill in meta information</svelte:fragment>
			<DifficultySelection bind:difficulty={difficulty} />
			<div>
				<label for="learning_objective_input">Learning Objectives:</label>
				<div class="flex gap-2">
					<input type="text" name="learning_objective_input" id="learning_objective_input" bind:this={loInput}
						   class="rounded-lg dark:bg-surface-800 bg-surface-50 text-surface-700 dark:text-surface-400">
					<button type="button" name="add_lo"
							on:click={() => { LOs.push(loInput.value); loInput.value = ""}}
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
							on:click={() => { tags.push(tagInput.value); tagInput.value = ""}}
							class="btn bg-surface-700 text-surface-50 rounded-lg hover:bg-opacity-85">+
					</button>
				</div>
				<div class="flex flex-wrap gap-2">
					{#each tags as tag}
						<Tag tagText={tag} removable={false} />
					{/each}
				</div>

				<label for="maintainers_input">Maintainers:</label>
				<div class="flex gap-2">
					<input type="text" name="maintainers_input" id="maintainers_input" bind:this={maintainersInput}
						   class="rounded-lg dark:bg-surface-800 bg-surface-50 text-surface-700 dark:text-surface-400">
					<button type="button" name="add_tag"
							on:click={() => { maintainers.push(maintainersInput.value); maintainersInput.value = ""}}
							class="btn bg-surface-700 text-surface-50 rounded-lg hover:bg-opacity-85">+
					</button>
				</div>
				<div class="flex flex-wrap gap-2">
					{#each maintainers as maintainer}
						<Tag tagText={maintainer} removable={false} />
					{/each}
				</div>

				<div class="flex gap-2">
					<div class="w-1/2">
						<label for="estimate">Time Estimate:</label>
						<input type="text" name="estimate" bind:value={estimate}
							   class="rounded-lg dark:bg-surface-800 bg-surface-50 w-full text-surface-700 dark:text-surface-400">
					</div>
					<div class="w-1/2">
						<label for="copyright">Copyright:</label>
						<input type="text" name="copyright" bind:value={copyright}
							   class="rounded-lg dark:bg-surface-800 bg-surface-50 w-full text-surface-700 dark:text-surface-400">
					</div>
				</div>
			</div>
		</Step>
		<Step>
			<svelte:fragment slot="header">Review</svelte:fragment>
			<div class="flex flex-col gap-2">
				<h2 class="text-2xl">Title: {title}</h2>
				<p class="text-lg">Description: {description}</p>
				<p class="text-lg">Difficulty: {difficulty}</p>
				<p class="text-lg">Learning Objectives: {LOs.join(', ')}</p>
				<p class="text-lg">Tags: {tags.join(', ')}</p>
				<p class="text-lg">Time Estimate: {estimate}</p>
				<p class="text-lg">Copyright: {copyright}</p>
			</div>
			<FileTable download={false} {files} />
		</Step>
	</Stepper>
</form>