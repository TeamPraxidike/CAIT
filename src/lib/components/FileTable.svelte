<script lang="ts">
	import Icon from '@iconify/svelte';
	import { IconMap } from '$lib/util/file';
	import { getModalStore } from '@skeletonlabs/skeleton';
	import { Render } from '$lib';

	export let files: FileList;

	export let download: boolean;
	const ms = getModalStore();


	function activateModal(file: File) {
		ms.trigger({
			type: 'component',
			component: { ref: Render, props: { file } }
		});
	}
</script>

<div class="rounded-lg p-1">
	<h4>Uploaded files</h4>
	{#if files}
		<div class="flex flex-col gap-2">
			{#each files as file}
				<button type="button"
						class="hover:bg-gray-200 transition-colors duration-75 flex items-center rounded-lg gap-2 p-3 bg-gray-100"
						on:click={() => activateModal(file)}>
					<Icon icon={IconMap.get(file.type) || 'vscode-icons:file-type-text'}
						  class="text-xl text-surface-500" />
					<button type="button"
							class="hover:text-surface-700 underline cursor-pointer text-surface-500">{file.name}</button>
					{#if download}
						<a type="button" href={URL.createObjectURL(file)} download="{file.name}" class="ml-auto">
							<Icon class="xl:text-2xl" icon="material-symbols:download" />
						</a>
					{/if}
				</button>
			{/each}
		</div>
	{/if}
</div>