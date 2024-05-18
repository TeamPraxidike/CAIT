<script lang="ts">
	import { DifficultySelection, FileTable, authStore, Meta, Tag, Filter } from '$lib';
	import {
		FileDropzone,
		Stepper,
		Step,
		Autocomplete,
		type AutocompleteOption,
		InputChip
	} from '@skeletonlabs/skeleton';
	import { fade } from 'svelte/transition';
	import { enhance } from '$app/forms';

	import type { ActionData, PageServerData } from './$types';
	import type { Difficulty, Tag as PrismaTag } from '@prisma/client';

	let tags: string[] = [];

	$: tags = tags;

	let maintainers: string[] = [];
	let files: FileList;

	let title: string = '';
	let description: string = '';
	let difficulty: Difficulty = 'easy';
	let estimate: string = '';
	let copyright: string = '';
	let LOs: string[] = [];

	let loInput: HTMLInputElement;
	let maintainersInput: HTMLInputElement;
	let inputChip: InputChip;

	$: uid = $authStore.user?.id || 0;

	// eslint-disable-next-line svelte/valid-compile
	export let form: ActionData;
	export let data: PageServerData;

	let allTags: PrismaTag[] = data.tags;

	type TagOption = AutocompleteOption<string, { content: string }>;

	let flavorOptions: TagOption[] = allTags.map(tag => {
		return {
			value: tag.content,
			label: tag.content
		};
	});

	let tagInput = '';

	function onInputChipSelect(e: CustomEvent<TagOption>): void {
		console.log('onInputChipSelect', e.detail);
		if (!tags.includes(e.detail.value)) {
			inputChip.addChip(e.detail.value);
			tagInput = '';
		}
	}
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
	  use:enhance={({ formData }) => {
        Array.from(files).forEach(file => {
          if (file.size > 1024 * 1024 * 100) {
            alert('File size exceeds 100MB');
          } else {
            formData.append('file', file);
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
			<div class="w-full">
				<label for="learning_objective_input">Learning Objectives:</label>
				<div class="flex gap-2">
					<input type="text" name="learning_objective_input" id="learning_objective_input" bind:this={loInput}
						   class="rounded-lg dark:bg-surface-800 bg-surface-50 text-surface-700 dark:text-surface-400">
					<button type="button" name="add_lo"
							on:click={() => { LOs.push(loInput.value); loInput.value = ""; }}
							class="btn bg-surface-700 text-surface-50 rounded-lg hover:bg-opacity-85">+
					</button>
				</div>
				<ol class="list-decimal bg-surface-100 list-inside gap-2 max-h-40 overflow-y-auto">
					{#each LOs as LO}
						<li transition:fade={{ duration: 200 }}>{LO}</li>
					{/each}
				</ol>

				<label for="tags_input">Tags:</label>
				<div class="text-token w-1/2 space-y-2">
					<InputChip bind:this={inputChip} whitelist={allTags.map(t => t.content)} bind:input={tagInput} bind:value={tags} name="chips" />
					<div class="card w-full max-h-48 p-4 overflow-y-auto" tabindex="-1">
						<Autocomplete bind:input={tagInput} options={flavorOptions} denylist={tags} on:selection={onInputChipSelect} />
					</div>
				</div>

				<label for="maintainers_input">Maintainers:</label>
				<div class="flex gap-2">
					<input type="text" name="maintainers_input" id="maintainers_input" bind:this={maintainersInput}
						   class="rounded-lg dark:bg-surface-800 bg-surface-50 text-surface-700 dark:text-surface-400">
					<button type="button" name="add_tag"
							on:click={() => { maintainers.push(maintainersInput.value); maintainersInput.value = ""; }}
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