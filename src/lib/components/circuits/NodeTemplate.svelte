<script lang="ts">

	import { IconMapExtension } from '$lib/util/file';
	import Icon from '@iconify/svelte';

	export let data : any;
	export let selected: boolean;
	let text = selected ? 'text-surface-50' : 'text-surface-700 hover:text-surface-50';
	export let extensions: string[];
	export let isMaterial: boolean;

	export let dummyNode: boolean = false;
</script>
{#if dummyNode}
	<div class="rounded-full size-[20px] bg-surface-800"/>
{:else}
	<div style="  overflow-wrap: break-word;"
			 class=" {text}  border border-primary-500 w-[180px] h-[100px] rounded-lg flex flex-col items-center justify-center gap-2 p-1">
		<p class="line-clamp-3 text-xs max-w-full break-word">{data}</p>
		<div class="flex gap-2">
			{#if isMaterial}
				{#each extensions as e}
					<Icon icon={IconMapExtension.get(e) || 'vscode-icons:file-type-text'} class="text-lg self-center" />
				{/each}
			{:else}
				<Icon icon="tabler:binary-tree-2" class="text-xl self-center text-primary-600" />
			{/if}
		</div>
	</div>
{/if}


