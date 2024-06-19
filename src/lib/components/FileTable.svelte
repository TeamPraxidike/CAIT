<script lang="ts">
	import Icon from '@iconify/svelte';
	import { IconMap } from '$lib/util/file';
	import { getModalStore } from '@skeletonlabs/skeleton';
	import { Download, Render } from '$lib';
	import { slide } from 'svelte/transition';
	import { flip } from 'svelte/animate';

	export let files: FileList | any[];

	export let operation: 'download' | 'view' | 'edit' = 'view';
	const ms = getModalStore();


	function activateModal(file: File) {
		ms.trigger({
			type: 'component',
			component: { ref: Render, props: { file } }
		});
	}

	function removeFile(file: File) {
		files = Array.from(files).filter(f => f.name !== file.name) as unknown as FileList;
	}
</script>

<div class="rounded-lg p-1">
	{#if files ? files.length === 0 : true}
		<p class="text-error-300 dark:text-error-400">Upload at least one file to continue</p>
	{:else}
		<h4>Uploaded files</h4>
	{/if}
	{#if files}
		<div class="flex flex-col gap-1">
			{#each files as file (file.name)}
				<button type="button" animate:flip={{ delay: 0, duration: 200 }}
						class="hover:bg-gray-200 transition-colors duration-75 flex items-center rounded-lg gap-2 p-3 bg-gray-100 dark:hover:bg-surface-700 dark:bg-surface-800"
						on:click={() => activateModal(file)}
						transition:slide={{ delay: 0, duration: 200, axis: 'x' }}>
					<Icon icon={IconMap.get(file.type) || 'vscode-icons:file-type-text'}
						  class="text-xl text-surface-500" />
					<span class="hover:text-surface-700 underline cursor-pointer dark:text-surface-200 dark:hover:text-surface-600 text-surface-500">{file.name}</span>
					{#if operation === 'download'}
						<Download file={file} className="ml-auto">
							<Icon class="xl:text-2xl" icon="material-symbols:download" />
						</Download>
					{:else if operation === 'edit'}
						<button on:click={() => removeFile(file)} type="button" on:click|stopPropagation class="ml-auto flex gap-2 items-center">
							<Icon class="xl:text-2xl" icon="mdi:delete" />
						</button>
					{/if}
				</button>
			{/each}
		</div>
	{/if}
</div>