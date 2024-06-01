<script lang="ts">

	import { IconMapExtension } from '$lib/util/file';
	import Icon from '@iconify/svelte';

	export let data : any;
	export let selected: boolean;
	let text = selected ? 'text-surface-50' : 'text-surface-700 hover:text-surface-50';
	export let extensions: string[];
	console.log("Extensions for" + data)
	console.log(extensions);
</script>

<div style="  overflow-wrap: break-word;"
		 class="{text}  border border-primary-500 w-[180px] h-[100px] rounded-lg flex flex-col items-center justify-center gap-2 p-1">
	<p class="line-clamp-3 text-xs max-w-full break-word">{data}</p>
	<div class="flex gap-2">
		{#each extensions as e}
			<Icon icon={IconMapExtension.get(e) || 'vscode-icons:file-type-text'} class="text-lg self-center" />
		{/each}
	</div>
</div>

