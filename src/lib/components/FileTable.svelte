<script lang="ts">
	import Icon from '@iconify/svelte';
	import { getURLIcon, IconMap } from '$lib/util/file';
	import { getModalStore } from '@skeletonlabs/skeleton';
	import { Download, Render } from '$lib';
	import { slide } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import type { FetchedFileArray, FetchedFileItem } from '$lib/database';
	import { deleteFileTUSMetadata, type FileTUSMetadata, saveFiles } from '$lib/util/indexDB';

	// export let files: FileList | any[];
	// it's a FileList during upload, it's a FetchedFileArray when fetched from the backend
	export let files: FileList | FetchedFileArray;
	export let fileURLs: string[] = [];

	// TODO: a better name could go a long way
	export let fileFormat: 'upload' | 'fetch' = 'fetch';
	export let operation: 'download' | 'view' | 'edit' = 'view';

	// TODO: these could be merged
	export let fileTUSMetadata: { [key: string] : FileTUSMetadata } = {}
	export let fileTUSProgress: { [key: string]: any } = {}
	export let fileTUSUploadObjects: { [key: string]: any } = {}

	export let supabaseClient: any = null;

	// these are purely for the editing page
	// TODO: either find a different solution or redo UploadFilesForm + FileTable
	export let isEditContext: boolean = false;
	export let originalFileIds: string[] = [];


	// reason given by user for the change
	export let fileChangeComments: {
		added: Record<string, string>;
		deleted: Record<string, string>;
	} = { added: {}, deleted: {} };


	export let progressBarColor = '#00A6D6'

	const ms = getModalStore();

	$: warning = (files && files.length === 0) && (fileURLs && fileURLs.length === 0);

	function activateModal(file: File | FetchedFileItem) {
		ms.trigger({
			type: 'component',
			component: { ref: Render, props: { file, fileFormat, supabaseClient } }
		});
	}

	function removeFileConfirmationModal(file: File | FetchedFileItem) {
        const fileName = file.name || '';

        ms.trigger({
            type: 'prompt',
            title: 'Confirm File Deletion',
            body: `File "${fileName.length > 20 ? fileName.slice(0, 20) + '...' : fileName}" will be permanently removed once you save your changes (during the last step). Are you sure you wish to proceed?`,
            // Configuration for the input box
            value: fileChangeComments.deleted[fileName] || '',
            valueAttr: {
                type: 'text',
                minlength: 0,
                placeholder: 'Give reason for deletion (optional).',
                required: false
            },
            response: (r: string | false) => {
                // 'prompt' returns the string value on Confirm, or false on Cancel.
                if (r !== false) {
                    // 1. Capture the reason (key by filename)
                    fileChangeComments.deleted[fileName] = r;

                    // 2. Proceed with deletion
                    removeFile(file);
                }
            }
        })
    }

	async function removeFile(file: File | FetchedFileItem) {
		// this branch doesn't really get explored but will leave for clarity
		if (fileFormat === 'fetch') {
			files = Array.from(files as FetchedFileArray).filter(f => f.fileId !== (file as FetchedFileItem).fileId);
		} else {
			files = Array.from(files as FileList).filter(f => f.name !== (file as File).name) as unknown as FileList;

			// TODO error handling
			try{
				// if on upload page
				if (!isEditContext) {
					// file user has chosen has already been uploaded
					if (fileTUSMetadata[file.name || ''] && fileTUSMetadata[file.name || '']['isDone']) {
						await supabaseClient
								.storage
								.from('uploadedFiles')
								.remove([fileTUSMetadata[file.name || '']['generatedName']]);
					}
					// file user has chosen is still being uploaded
					else if (fileTUSUploadObjects[(file as File).name]){
						fileTUSUploadObjects[(file as File).name].abort(true);
						fileTUSUploadObjects = {...fileTUSUploadObjects};
					}
				}
				// if on edit page
				else{
					// file user has chosen has already been uploaded
					if (fileTUSMetadata[file.name || ''] && fileTUSMetadata[file.name || '']['isDone']) {
						// NB: if the file has been uploaded, will delete later with the filediff action logic
						// this is a no-op
					}
					// file user has chosen is still being uploaded
					else if (fileTUSUploadObjects[(file as File).name]){

						fileTUSUploadObjects[(file as File).name].abort(true);
						fileTUSUploadObjects = {...fileTUSUploadObjects};
					}
				}
			}
			catch (e){
				console.log("Could not delete/abort file");
				console.error(e);
			}

			if ((file as File).name in fileTUSProgress){
				delete fileTUSProgress[(file as File).name];
				fileTUSProgress = {...fileTUSProgress};
			}
			if ((file as File).name in fileTUSMetadata){
				delete fileTUSMetadata[(file as File).name];
				fileTUSMetadata = {...fileTUSMetadata};
			}
			if ((file as File).name in fileTUSUploadObjects){
				delete fileTUSUploadObjects[(file as File).name];
				fileTUSUploadObjects = {...fileTUSUploadObjects};
			}

			if (!isEditContext){
				await deleteFileTUSMetadata((file as File).name);
				// this also deletes the indexDb file because it's a PUT operation
				await saveFiles(Array.from(files))
			}
		}
	}
	function removeURL(url: string) {
		fileURLs = Array.from(fileURLs).filter(x => x !== url) as string[];
	}

	function isNewFile(file: File | FetchedFileItem) {
		if (!isEditContext) return false;
		if ('fileId' in file) return false;
		// If we have metadata, check if the ID matches an original file
		const fileName = file.name || '';
		if (fileTUSMetadata[fileName]) {
			return !originalFileIds.includes(fileTUSMetadata[fileName].generatedName);
		}
		return true;
	}

	let visibleComments: Record<string, boolean> = {};

	function toggleComment(name: string) {
		visibleComments[name] = !visibleComments[name];
		visibleComments = {...visibleComments};
	}
</script>

<div class="rounded-lg p-1">
	{#if warning}
		<p class="text-error-300 dark:text-error-400">Upload at least one material</p>
	{:else}
		<h4 class="block font-medium">Uploaded materials</h4>
	{/if}
	{#if files}
		<div class="flex flex-col gap-1">
			<!--{#each files as file (file.name)}-->
			{#each files as file (file.name)}
				<div class="relative rounded-lg overflow-hidden bg-gray-100 dark:bg-surface-800">
					{#if fileTUSProgress[file.name] && fileTUSMetadata[file.name]['isDone'] === false}
						<div class="progress-bar-container z-100">
							<div class="progress-bar-meter" style="width: {fileTUSProgress[file.name]}%; background-color: {progressBarColor};"></div>
						</div>
					{/if}
					<button type="button"
							class="w-full hover:bg-gray-200 transition-colors duration-75 flex items-center gap-2 p-3 dark:hover:bg-surface-700"
							on:click={() => activateModal(file)}
							transition:slide={{ delay: 0, duration: 200, axis: 'x' }}>
						<Icon icon={IconMap.get(file.type) || 'vscode-icons:file-type-text'}
							  class="text-xl text-surface-500" />
						<span class="hover:text-surface-700 underline cursor-pointer dark:text-surface-200 dark:hover:text-surface-600 text-surface-500">{file.name}</span>
						{#if operation === 'download'}
							<Download file={file} fileFormat={fileFormat} className="ml-auto">
								<Icon class="xl:text-2xl" icon="material-symbols:download" />
							</Download>
						{:else if operation === 'edit'}
							<div class="ml-auto flex gap-2 items-center">
								{#if isNewFile(file)}
									<button type="button" on:click|stopPropagation={() => toggleComment(file.name || '')} class="hover:text-primary-500" title="Add comment">
										<Icon class="xl:text-2xl" icon="mdi:comment-edit" />
									</button>
								{/if}
								<button on:click={() => {
									if (!isEditContext) removeFile(file);
									else removeFileConfirmationModal(file)
								}} type="button" on:click|stopPropagation>
									<Icon class="xl:text-2xl" icon="mdi:delete" />
								</button>
							</div>
						{/if}
					</button>
					{#if visibleComments[file.name || '']}
						<div class="p-2 bg-gray-50 dark:bg-surface-700 flex gap-2 items-center" transition:slide>
							<input type="text" class="input p-1" placeholder="Reason for adding this file..." bind:value={fileChangeComments.added[file.name || '']} on:click|stopPropagation />
						</div>
					{/if}
				</div>

			{/each}

			{#each fileURLs as url (url)}
				<button type="button" animate:flip={{ delay: 0, duration: 200 }}
						class="hover:bg-gray-200 transition-colors duration-75 flex items-center rounded-lg gap-2 p-3 bg-gray-100 dark:hover:bg-surface-700 dark:bg-surface-800"
						on:click={() => window.open(url, '_blank')?.focus()}
						transition:slide={{ delay: 0, duration: 200, axis: 'x' }}>

					<Icon icon={getURLIcon(url)}
						  class="text-xl text-surface-500" />
					<span class="text-left hover:text-surface-700 underline cursor-pointer dark:text-surface-200 dark:hover:text-surface-600 text-surface-500">{url}</span>
					{#if operation === 'edit'}
						<button on:click={() => removeURL(url)} type="button" on:click|stopPropagation class="ml-auto flex gap-2 items-center">
							<Icon class="xl:text-2xl" icon="mdi:delete" />
						</button>
					{/if}
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
    .progress-bar-container {
        top: 0;
        left: 0;
        right: 0;
        width: 100%;
        height: 3px;
        background-color: transparent;
    }

    .progress-bar-meter {
        height: 100%;
        transition: width 0.2s cubic-bezier(0.25, 1, 0.5, 1);
    }
</style>
