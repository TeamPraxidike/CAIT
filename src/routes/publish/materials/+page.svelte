<script lang="ts">
	import { DiffBar, DifficultySelection, FileTable, Filter, Meta, PublishReview, TheoryAppBar } from '$lib';
	import {
		FileButton,
		FileDropzone,
		getToastStore,
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
	import TagsSelect from "$lib/components/TagsSelect.svelte";
	import { onMount } from 'svelte';

	export let form: ActionData;
	export let data: PageServerData;

	// tags
	let tags: string[] = [];
	$: tags = tags;
	let allTags: PrismaTag[] = data.tags;
	let newTags: string[] = [];

	let files: FileList = [] as unknown as FileList;
	type UserWithProfilePic = User & { profilePicData: string };
	let maintainers: UserWithProfilePic[] = [];

	let users: UserWithProfilePic[] = data.users;
	let searchableUsers = users;
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
	let selectedType = "Select Type";
	let allTypes: {id:number, content:string }[] = ["Presentation", "Code", "Video", "Assignment", "Dataset", "Exam", "Other"].map(x => ({id : 0, content : x})); //array with all the tags MOCK

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

	function appendToFileList(e: Event) {
		const eventFiles = (e.target as HTMLInputElement).files;
		if (eventFiles) {
			files = concatFileList(files, eventFiles);
		}
	}

	/* LOCK = TRUE => LOCKED */
	const locks: boolean[] = [true, true, true];

	$: locks[0] = files ? files.length === 0 : true;
	$: locks[1] = title.length < 1 || description.length < 1 || selectedType === "Select Type";
	$: locks[2] = tags.length < 1 || LOs.length<1;


	const toastStore = getToastStore();

	$: if (form?.status === 200) {
		toastStore.trigger({
			message: 'Publication Added successfully',
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

	const handleBeforeUnload = (event: BeforeUnloadEvent) => {
		const confirmation = confirm('Data will be lost. Are you sure you want to proceed?');

		if (!confirmation) {
			event.preventDefault();
			return;
		}

	};

	onMount(() => {
		window.addEventListener('beforeunload', handleBeforeUnload);

		return () => {
			window.removeEventListener('beforeunload', handleBeforeUnload);
		};
	});

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
				formData.append('type', selectedType);
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
			<svelte:fragment slot="header">Upload files<span class="text-error-300">*</span></svelte:fragment>
			<FileDropzone on:change={appendToFileList} multiple name="file" />
			<FileTable operation="edit" bind:files={files} />
		</Step>
		<Step locked={locks[1]}>
			<svelte:fragment slot="header">Give your publication a title</svelte:fragment>
			<div class="flex flex-col gap-5">
				<div>
					<label for="title" >Title<span class="text-error-300">*</span></label>
					<input type="text" name="title" placeholder="Title" bind:value={title}
						   class="rounded-lg dark:bg-surface-800 bg-surface-50 w-full text-surface-700 dark:text-surface-400">
				</div>
				<div>
					<span>Select a type for the publication<span class="text-error-300">*</span>: </span>
					<Filter label="Type" profilePic="{false}" oneAllowed={true} bind:selectedOption={selectedType} bind:all={allTypes} selected={[]} num="{0}"/>
				</div>

				<textarea name="description" placeholder="Description..." bind:value={description}
						  class="rounded-lg h-40 resize-y dark:bg-surface-800 bg-surface-50 w-full text-surface-700 dark:text-surface-400" />
			</div>
			{#if coverPic}
				<button on:click={() => coverPic = undefined} type="button" class="btn py-2 px-4 bg-error-400 text-surface-50 rounded-full hover:bg-opacity-85">Remove Cover Picture</button>
			{:else}
				<FileButton on:change={chooseCover} name="coverPhoto">Upload Cover Picture</FileButton>
			{/if}

			{#if coverPic}
				<img src={URL.createObjectURL(coverPic)} alt="coverPicture" class="border-2 border-surface-700 w-1/2">
			{/if}
		</Step>
		<Step locked={locks[2]}>
			<svelte:fragment slot="header">Fill in meta information</svelte:fragment>
			<div class="flex flex-row p-6 justify-between">
				<div class="flex gap-4 items-center">
					<DifficultySelection bind:difficulty={difficulty} />
				</div>
				<div class="flex flex-col gap-2 items-start">
					<label for="theoryRatio">Theory Application Ratio</label>
					<TheoryAppBar bind:value={theoryApplicationRatio}/>
				</div>
			</div>

			<div class="grid grid-cols-2 gap-4 p-3">
				<div class="flex col-span-2 items-center gap-4 p-3">
					<div class="w-1/2">
						<label for="estimate">Time Estimate (in minutes):</label>
						<input type="number" name="estimate" bind:value={estimate} placeholder="How much time do the materials take"
							   class="rounded-lg dark:bg-surface-800 bg-surface-50 w-full text-surface-700 dark:text-surface-400 focus:ring-0 focus:border-primary-400">
					</div>
					<div class="w-1/2">
						<label for="copyright">Copyright License (<a href="https://www.tudelft.nl/library/support/copyright#c911762" target=”_blank”
						class="text-tertiary-700" > Check here how this applies to you</a>):</label>
						<input type="text" name="copyright" bind:value={copyright} placeholder="Leave blank if material is your own"
							   class="rounded-lg dark:bg-surface-800 bg-surface-50 w-full text-surface-700 dark:text-surface-400 focus:border-primary-400 focus:ring-0">
					</div>
				</div>
				<div class="col-span-2">
					<MetadataLOandPK bind:LOs={LOs} bind:priorKnowledge={PKs} adding="{true}"/>
				</div>
				<div class="flex flex-col w-full">
					<MantainersEditBar bind:searchableUsers={searchableUsers} users={users} bind:additionalMaintainers={maintainers}/>
					<TagsSelect allTags={allTags} bind:tags={tags} bind:newTags={newTags}/>
				</div>

			</div>
		</Step>
		<Step>
			<svelte:fragment slot="header">Review</svelte:fragment>
			<PublishReview bind:title={title} bind:description={description} bind:LOs={LOs}
										 bind:prior={PKs} bind:tags={tags}  bind:maintainers={maintainers}
										 />
			<div class="flex gap-2  pl-3">
				<p class="text-lg">Difficulty:</p>
				<DiffBar diff="{difficulty}"/>
			</div>
			<div class="pl-3 flex gap-3 items-center">
				<p class="text-lg">Theory to Application:</p>
				<TheoryAppBar value="{theoryApplicationRatio}" editable="{false}" />
			</div>
			<p class="text-lg pl-3">Type: {selectedType.toUpperCase()}</p>
			<p class="text-lg pl-3">Time Estimate: {#if estimate !== ''} {estimate} minutes {:else} No estimate provided {/if} </p>
			<p class="text-lg pl-3">Copyright: {copyright}</p>
			<div class="pl-3">
				<FileTable bind:files={files} />
			</div>
			{#if coverPic}
				<p class="text-lg pl-3"> Cover Picture: </p>
				<img src={URL.createObjectURL(coverPic)} alt="sss">
			{/if}
		</Step>
	</Stepper>
</form>