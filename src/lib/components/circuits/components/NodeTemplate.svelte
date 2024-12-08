<!--<script lang="ts">-->

<!--	import { IconMapExtension } from '$lib/util/file';-->
<!--	import Icon from '@iconify/svelte';-->

<!--	export let data : any;-->
<!--	export let selected: boolean;-->
<!--	export let extensions: string[];-->
<!--	export let isMaterial: boolean;-->

<!--	let text = selected ? 'text-surface-50' : 'text-surface-700';-->


<!--	export let dummyNode: boolean = false;-->
<!--</script>-->
<!--{#if dummyNode}-->
<!--	<button type="button" class="rounded-full size-[10px] bg-surface-800"/>-->
<!--{:else}-->
<!--	<button type="button" style="  overflow-wrap: break-word;"-->
<!--			 class=" {text} border border-primary-500 w-[180px] h-[100px] rounded-lg flex flex-col items-center justify-center gap-2 p-1">-->
<!--		<span class="line-clamp-3 text-xs max-w-full break-word">{data}</span>-->
<!--		<div class="flex gap-2">-->
<!--			{#if isMaterial}-->
<!--				{#each extensions as e}-->
<!--					<Icon icon={IconMapExtension.get(e) || 'vscode-icons:file-type-text'} class="text-lg self-center" />-->
<!--				{/each}-->
<!--			{:else}-->
<!--				<Icon icon="tabler:binary-tree-2" class="text-xl self-center text-primary-600" />-->
<!--			{/if}-->
<!--		</div>-->
<!--	</button>-->
<!--{/if}-->


<script lang="ts">
	import { Handle, type NodeProps, Position} from '@xyflow/svelte';
	import { IconMapExtension } from '$lib/util/file';
	import Icon from '@iconify/svelte';

	type $$Props = NodeProps;

	export let data: any;

	let text = data.selected ? 'text-surface-50' : 'text-surface-700';
</script>

<div class="custom">
	<Handle type="target" position={Position.Top} />
	<div style="  overflow-wrap: break-word;"
			class=" {text} border border-primary-500 w-[180px] h-[100px] rounded-lg flex flex-col items-center justify-center gap-2 p-1">
		<span class="line-clamp-3 text-xs max-w-full break-word">{data.label}</span>
		<div class="flex gap-2">
			{#if data.isMaterial}
				{#each data.extensions as e}
					<Icon icon={IconMapExtension.get(e) || 'vscode-icons:file-type-text'} class="text-lg self-center" />
				{/each}
			{:else}
				<Icon icon="tabler:binary-tree-2" class="text-xl self-center text-primary-600" />
			{/if}
		</div>
	</div>
	<Handle type="source" position={Position.Bottom} id="a" style="left: 10px;" />
	<Handle type="source" position={Position.Bottom} id="b" style="left: auto; right: 10px;" />
</div>