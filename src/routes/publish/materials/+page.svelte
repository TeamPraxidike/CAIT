<script lang="ts">
	import { authStore, DifficultySelection, FileTable, Meta, UserProp } from '$lib';
	import {
		Autocomplete,
		type AutocompleteOption, FileButton,
		FileDropzone,
		getToastStore,
		InputChip,
		Step,
		Stepper
	} from '@skeletonlabs/skeleton';
	import { fade } from 'svelte/transition';
	import { enhance } from '$app/forms';
	import type { ActionData, PageServerData } from './$types';
	import type { Difficulty, Tag as PrismaTag, User } from '@prisma/client';
	import { concatFileList } from '$lib/util/file';
	import { goto } from '$app/navigation';

	export let form: ActionData;
	export let data: PageServerData;

	// tags
	let tags: string[] = [];
	$: tags = tags;
	let allTags: PrismaTag[] = data.tags;
	let inputChip: InputChip;
	let tagInput = '';

	// maintainerIds
	let maintainersInput: HTMLInputElement;
	let files: FileList = [] as unknown as FileList;
	type UserWithProfilePic = User & { profilePicData: string };
	let maintainers: UserWithProfilePic[] = [];

	// learning objectives
	let loInput: HTMLInputElement;
	let LOs: string[] = [];
	$: LOs = LOs;

	// input data
	let title: string = '';
	let description: string = '';
	let difficulty: Difficulty = 'easy';
	let estimate: string = '';
	let copyright: string = '';

	// cover
	let coverPic: File | undefined = undefined;
	function chooseCover(e: Event) {
		const eventFiles = (e.target as HTMLInputElement).files;
		if (eventFiles) {
			if (eventFiles[0].type === 'image/jpeg' || eventFiles[0].type === 'image/png')
				coverPic = eventFiles[0];
			else
				toastStore.trigger({
					message: 'Invalid file type, please upload a .jpg or .png file',
					background: 'bg-warning-200'
				});
		}
	}

	$: uid = $authStore.user?.id;

	type TagOption = AutocompleteOption<string, { content: string }>;
	let flavorOptions: TagOption[] = allTags.map(tag => {
		return {
			value: tag.content,
			label: tag.content
		};
	});

	function onInputChipSelect(e: CustomEvent<TagOption>): void {
		console.log('onInputChipSelect', e.detail);
		if (!tags.includes(e.detail.value)) {
			inputChip.addChip(e.detail.value);
			tagInput = '';
		}
	}

	function appendToFileList(e: Event) {
		const eventFiles = (e.target as HTMLInputElement).files;
		if (eventFiles) {
			files = concatFileList(files, eventFiles);
		}
	}

	async function fetchMaintainer() {
		const input = maintainersInput.value;


		let res: UserWithProfilePic | undefined = undefined;

		if (isNaN(Number(input))) {
			data.users.find((user: UserWithProfilePic) => {
				if (user.firstName === input || user.lastName === input) {
					res = user;
				}
			});
		} else {
			data.users.find((user: UserWithProfilePic) => {
				if (user.id === Number(input)) {
					res = user;
				}
			});
		}

		if (res === undefined) {
			toastStore.trigger({
				message: 'User not found',
				background: 'bg-warning-200'
			});
		} else if (maintainers.find((m: User) => {
			if (res !== undefined) m.id === res.id;
		})) {
			toastStore.trigger({
				message: 'User already added',
				background: 'bg-warning-200'
			});
			return;
		} else {
			maintainers = [...maintainers, res];
			maintainersInput.value = '';
		}
	}

	function handleRemoveMaintainer(index: number) {
		maintainers = maintainers.filter((_, i) => i !== index);
	}

	/* LOCK = TRUE => LOCKED */
	const locks: boolean[] = [true, true, true];

	$: locks[0] = files ? files.length === 0 : true;
	$: locks[1] = title.length < 2 || description.length < 10;
	$: locks[2] = tags.length < 2;


	const toastStore = getToastStore();

	$: if (form?.status === 200) {
		toastStore.trigger({
			message: 'Publication Edited successfully',
			background: 'bg-success-200'
		});
		goto(`/${$authStore.user?.id}/${form?.id}`);
	} else if (form?.status === 400) {
		toastStore.trigger({
			message: `Malformed information, please check your inputs: ${form?.message}`,
			background: 'bg-warning-200'
		});
	} else if (form?.status === 500) {
		toastStore.trigger({
			message: 'An error occurred, please try again later or contact support',
			background: 'bg-error-200'
		});
	}
</script>

<Meta title="Publish" description="CAIT" type="site" />

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

        formData.append('userId', uid?.toString() || '');
        formData.append('title', title);
        formData.append('description', description);
        formData.append('difficulty', difficulty);
        formData.append('estimate', estimate);
        formData.append('copyright', copyright);
        formData.append('tags', JSON.stringify(tags));
        formData.append('maintainers', JSON.stringify(maintainers.map(m => m.id)));
        formData.append('learningObjectives', JSON.stringify(LOs));
        formData.append('coverPic', coverPic || '');
      }}>
	<Stepper buttonCompleteType="submit">
<!--		<Step locked={locks[0]}>-->
<!--			<svelte:fragment slot="header">Upload files</svelte:fragment>-->
<!--			<FileDropzone on:change={appendToFileList} multiple name="file" />-->
<!--			<FileTable operation="edit" bind:files={files} />-->
<!--		</Step>-->
<!--		<Step locked={locks[1]}>-->
<!--			<svelte:fragment slot="header">Give your publication a title</svelte:fragment>-->
<!--			<div class="flex flex-col gap-2">-->
<!--				<input type="text" name="title" placeholder="Title" bind:value={title}-->
<!--					   class="rounded-lg dark:bg-surface-800 bg-surface-50 w-full text-surface-700 dark:text-surface-400">-->
<!--				<textarea name="description" placeholder="Description..." bind:value={description}-->
<!--						  class="rounded-lg h-40 resize-y dark:bg-surface-800 bg-surface-50 w-full text-surface-700 dark:text-surface-400" />-->
<!--			</div>-->
<!--			<label for="coverPhoto">Cover Picture:</label>-->
<!--			<FileButton on:change={chooseCover} name="coverPhoto">Upload File</FileButton>-->
<!--			{#if coverPic}-->
<!--				<button on:click={() => coverPic = undefined} type="button" class="btn">Remove</button>-->
<!--				<img src={URL.createObjectURL(coverPic)} alt="sss">-->
<!--			{/if}-->
<!--		</Step>-->
		<Step locked={locks[2]}>
			<svelte:fragment slot="header">Fill in meta information</svelte:fragment>
			<div class="flex gap-4 items-center">
				<label for="difficulty">Difficulty:</label>
				<DifficultySelection bind:difficulty={difficulty} />
			</div>
			<div class="grid grid-cols-2 gap-4">
				<div class="flex col-span-2 items-center gap-4">
					<div class="w-1/2">
						<label for="estimate">Time Estimate:</label>
						<input type="number" name="estimate" bind:value={estimate}
							   class="rounded-lg dark:bg-surface-800 bg-surface-50 w-full text-surface-700 dark:text-surface-400">
					</div>
					<div class="w-1/2">
						<label for="copyright">Copyright:</label>
						<input type="text" name="copyright" bind:value={copyright}
							   class="rounded-lg dark:bg-surface-800 bg-surface-50 w-full text-surface-700 dark:text-surface-400">
					</div>
				</div>
				<div class="col-span-2">
					<label for="maintainers">Maintainers:</label>
					<div class="flex gap-2">
						<input type="text" name="maintainers" id="maintainers" bind:this={maintainersInput}
							   class="rounded-lg dark:bg-surface-800 bg-surface-50 text-surface-700 dark:text-surface-400 flex-grow">
						<button type="button" name="add_maintainer" inputmode="decimal"
								on:click={fetchMaintainer}
								class="btn bg-surface-700 text-surface-50 rounded-lg hover:bg-opacity-85">+
						</button>
					</div>
					<div class="flex my-2">
						{#if $authStore.user}
							<UserProp
								user={$authStore.user} view="publish" role="Publisher" userPhotoUrl={'data:image;base64,' + $authStore.user.profilePicData} />
							{#each maintainers as maintainer, key (maintainer.id)}
								<UserProp on:removeMaintainer={() => handleRemoveMaintainer(key)} user={maintainer}
										  view="publish"
										  role="Maintainer" userPhotoUrl={'data:image;base64,' + maintainer.profilePicData} />
							{/each}
						{/if}
					</div>
				</div>
				<div>
					<label for="tags_input">Tags:</label>
					<div class="text-token space-y-2">
						<InputChip bind:this={inputChip} whitelist={allTags.map(t => t.content)}
								   bind:input={tagInput} bind:value={tags} name="chips" />
						<div class="card w-full max-h-48 p-4 overflow-y-auto" tabindex="-1">
							<Autocomplete bind:input={tagInput} options={flavorOptions} denylist={tags}
										  on:selection={onInputChipSelect} />
						</div>
					</div>
				</div>
				<div>
					<label for="learning_objective_input">Learning Objectives:</label>
					<div class="flex gap-2">
						<input type="text" name="learning_objective_input" id="learning_objective_input"
							   bind:this={loInput}
							   class="rounded-lg dark:bg-surface-800 bg-surface-50 text-surface-700 dark:text-surface-400 flex-grow">
						<button type="button" name="add_lo"
								on:click={() => { LOs = [...LOs, loInput.value]; loInput.value = ""; }}
								class="btn bg-surface-700 text-surface-50 rounded-lg hover:bg-opacity-85">+
						</button>
					</div>
					<ol class="list-decimal bg-surface-100 list-inside gap-2 max-h-40 overflow-y-auto">
						{#each LOs as LO}
							<li transition:fade={{ duration: 200 }}>{LO}</li>
						{/each}
					</ol>
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
			<FileTable bind:files={files} />
		</Step>
	</Stepper>
</form>