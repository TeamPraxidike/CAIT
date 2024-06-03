<script lang="ts">
	import { DifficultySelection, FileTable, Meta, TheoryAppBar } from '$lib';
	import {
		Autocomplete,
		type AutocompleteOption, FileButton,
		FileDropzone,
		getToastStore,
		InputChip,
		Step,
		Stepper
	} from '@skeletonlabs/skeleton';
	import { enhance } from '$app/forms';
	import type { ActionData, PageServerData } from './$types';
	import type { Difficulty, Tag as PrismaTag, User } from '@prisma/client';
	import { concatFileList } from '$lib/util/file';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import MetadataLOandPK from "$lib/components/MetadataLOandPK.svelte";
	import MantainersEditBar from "$lib/components/user/MantainersEditBar.svelte";

	export let form: ActionData;
	export let data: PageServerData;

	// tags
	let tags: string[] = [];
	$: tags = tags;
	let allTags: PrismaTag[] = data.tags;
	let inputChip: InputChip;
	let tagInput = '';
	let newTags: string[] = [];

	let files: FileList = [] as unknown as FileList;
	type UserWithProfilePic = User & { profilePicData: string };
	let maintainers: UserWithProfilePic[] = [];

	// learning objectives
	let LOs: string[] = [];
	$: LOs = LOs;

	let PKs: string[] = [];
	$: PKs = PKs;

	// input data
	let title: string = '';
	let description: string = '';
	let difficulty: Difficulty = 'easy';
	let estimate: string = '';
	let copyright: string = '';
	let theoryApplicationRatio = 0.5;

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

	$: uid = $page.data.session?.user.id;

	type TagOption = AutocompleteOption<string, { content: string }>;
	let flavorOptions: TagOption[] = allTags.map(tag => {
		return {
			value: tag.content,
			label: tag.content
		};
	});

	const triggerRepeatInput = (type: string,input: string)=>{
		toastStore.trigger({
			message: `${type} ${input} Already Added`,
			background: 'bg-warning-200'
		});
	}

	const handleInvalid = () => {
		if(tagInput.length>0 && !tags.includes(tagInput)) {
			tags=[...tags,tagInput];
			newTags=[...newTags,tagInput];
			tagInput='';
		}
		else {
			triggerRepeatInput("Tag",tagInput);
		}
	}


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
		goto(`/${$page.data.session?.user.id}/${form?.id}`);
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
	console.log("hello 2")
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
		formData.append('prerequisites', JSON.stringify(PKs));
        formData.append('coverPic', coverPic || '');
		formData.append('newTags', JSON.stringify(newTags));
		formData.append('theoryToApplication', JSON.stringify(theoryApplicationRatio))
      }}>
	<Stepper buttonCompleteType="submit">
		<Step locked={locks[0]}>
			<svelte:fragment slot="header">Upload files</svelte:fragment>
			<FileDropzone on:change={appendToFileList} multiple name="file" />
			<FileTable operation="edit" bind:files={files} />
		</Step>
		<Step locked={locks[1]}>
			<svelte:fragment slot="header">Give your publication a title</svelte:fragment>
			<div class="flex flex-col gap-2">
				<input type="text" name="title" placeholder="Title" bind:value={title}
					   class="rounded-lg dark:bg-surface-800 bg-surface-50 w-full text-surface-700 dark:text-surface-400">
				<textarea name="description" placeholder="Description..." bind:value={description}
						  class="rounded-lg h-40 resize-y dark:bg-surface-800 bg-surface-50 w-full text-surface-700 dark:text-surface-400" />
			</div>
			<label for="coverPhoto">Cover Picture:</label>
			<FileButton on:change={chooseCover} name="coverPhoto">Upload File</FileButton>
			{#if coverPic}
				<button on:click={() => coverPic = undefined} type="button" class="btn">Remove</button>
				<img src={URL.createObjectURL(coverPic)} alt="sss">
			{/if}
		</Step>
		<Step locked={locks[2]}>
			<svelte:fragment slot="header">Fill in meta information</svelte:fragment>
			<div class="flex flex-row p-6 justify-between">
				<div class="flex gap-4 items-center">
					<DifficultySelection bind:difficulty={difficulty} />
				</div>
				<TheoryAppBar bind:value={theoryApplicationRatio}/>
			</div>
			<div class="grid grid-cols-2 gap-4 p-3">
				<div class="flex col-span-2 items-center gap-4 p-3">
					<div class="w-1/2">
						<label for="estimate">Time Estimate (in minutes):</label>
						<input type="number" name="estimate" bind:value={estimate} placeholder="How much time do the materials take"
							   class="rounded-lg dark:bg-surface-800 bg-surface-50 w-full text-surface-700 dark:text-surface-400">
					</div>
					<div class="w-1/2">
						<label for="copyright">Copyright License (<a href="https://www.tudelft.nl/library/support/copyright#c911762" target=”_blank”
						class="text-tertiary-700" > Check here how this applies to you</a>):</label>
						<input type="text" name="copyright" bind:value={copyright} placeholder="Leave blank if material is your own"
							   class="rounded-lg dark:bg-surface-800 bg-surface-50 w-full text-surface-700 dark:text-surface-400">
					</div>
				</div>
				<div class="col-span-2">
					<MetadataLOandPK bind:LOs={LOs} bind:priorKnowledge={PKs}/>
				</div>
				<div class="flex flex-col w-full">
					<MantainersEditBar users={data.users}/>
					<div>
						<label for="tags_input">Tags:</label>
						<div class="text-token space-y-2">
							<InputChip bind:this={inputChip} whitelist={allTags.map(t => t.content)}
									   bind:input={tagInput} bind:value={tags} name="chips" on:invalid={handleInvalid} class="dark:bg-transparent dark:border-surface-300 dark:text-surface-300 bg-transparent text-surface-800 border-surface-700"/>
							<div class="card w-full max-h-48 p-4 overflow-y-auto" tabindex="-1">
								<Autocomplete bind:input={tagInput} options={flavorOptions} denylist={tags}
											  on:selection={onInputChipSelect} />
							</div>
						</div>
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
			<FileTable bind:files={files} />
		</Step>
	</Stepper>
</form>