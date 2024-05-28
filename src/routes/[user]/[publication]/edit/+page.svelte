<script lang="ts">
	import type { LayoutServerData } from '../$types';
	import type { ActionData, PageServerData } from './$types';
	import type { Difficulty, Publication, Tag as PrismaTag } from '@prisma/client';
	import { authStore, FileTable, Meta } from '$lib';
	import {
		Autocomplete, type AutocompleteOption, FileButton, FileDropzone, getToastStore, InputChip
	} from '@skeletonlabs/skeleton';
	import { appendFile, base64ToFile, concatFileList, createFileList } from '$lib/util/file';
	import type { PublicationView } from '../+layout.server';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';

	export let data: LayoutServerData & PageServerData;
	let serverData: PublicationView = data.loadedPublication.loadedPublication;
	let publication: Publication = serverData.material.publication;

	let tags: string[] = serverData.material.publication.tags.map(tag => tag.content);
	let files: FileList = createFileList(serverData.fileData, serverData.material.files);

	let LOs: string[] = serverData.material.publication.learningObjectives;
	let difficulty: Difficulty = serverData.material.publication.difficulty;
	let maintainers: number[] = [$authStore.user?.id || 1];
	let coverPic: File | undefined = base64ToFile(serverData.coverFileData.data, 'cover.jpg', 'image/jpeg');

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


	let inputChip: InputChip;
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
		if (!tags.includes(e.detail.value)) {
			inputChip.addChip(e.detail.value);
			tagInput = '';
		}
	}

	export let form: ActionData;
	const toastStore = getToastStore();

	$: if (form?.status === 200) {
		toastStore.trigger({
			message: 'Publication Edited successfully',
			background: 'bg-success-200'
		});
		goto(`/${publication.publisherId}/${publication.id}`);
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

	export function changeFilezone(e: Event) {
		const eventFiles = (e.target as HTMLInputElement).files;
		if (eventFiles) {
			files = concatFileList(files, eventFiles);
		}
	}
</script>


<Meta title={publication.title} description="CAIT" type="site" />

<form action="?/edit" method="POST" enctype="multipart/form-data"
	  class="col-span-full my-20"
	  use:enhance={({ formData }) => {
        Array.from(files).forEach(file => appendFile(formData, file, 'file'));
		formData.append('oldFiles', JSON.stringify(serverData.material.files));
		formData.append('oldFilesData', JSON.stringify(serverData.fileData));

		formData.append('userId', $authStore.user?.id.toString() || '');
		formData.append('tags', tags.join(';'));
		formData.append('difficulty', difficulty);
		formData.append('maintainers', maintainers.join(';'));
		formData.append('learning_objectives', LOs.join(';'));
		formData.append('coverPic', coverPic || '');
    }}>

	<h2 class="text-lg md:text-xl lg:text-2xl xl:text-3xl font-semibold">Edit Publication</h2>
	<p>{serverData.material.publication.publisher.firstName}</p>

	<hr class="my-10">

	<div class="flex flex-col gap-2">
		<input type="text" id="title" name="title" value={publication.title}
			   class="rounded-lg dark:bg-surface-800 bg-surface-50 w-full text-surface-700 dark:text-surface-400">

		<textarea id="description" name="description"
				  class="rounded-lg h-40 resize-y dark:bg-surface-800 bg-surface-50 w-full text-surface-700 dark:text-surface-400"
		>{publication.description}</textarea>
	</div>

	<div class="mt-10 mb-20 w-full">
		<FileDropzone on:change={changeFilezone} multiple name="fileInputBind" />
		<FileTable operation="edit" bind:files={files} />
	</div>

	<div>
		<label for="coverPhoto">Cover Picture:</label>
		<FileButton on:change={chooseCover} name="coverPhoto">Upload File</FileButton>
		{#if coverPic}
			<button on:click={() => coverPic = undefined} type="button" class="btn">Remove</button>
			<img src={URL.createObjectURL(coverPic)} alt="sss">
		{/if}
	</div>

	<div class="text-token w-1/2 space-y-2">
		<InputChip bind:this={inputChip} whitelist={allTags.map(t => t.content)} bind:input={tagInput} bind:value={tags}
				   name="chips" />
		<div class="card w-full max-h-48 p-4 overflow-y-auto" tabindex="-1">
			<Autocomplete bind:input={tagInput} options={flavorOptions} denylist={tags}
						  on:selection={onInputChipSelect} />
		</div>
	</div>

	<button type="submit" class="btn rounded-lg variant-filled-primary text-surface-50">Edit</button>
</form>