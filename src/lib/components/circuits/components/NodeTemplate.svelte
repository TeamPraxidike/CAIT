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
	import type { NodeTemplateData } from '$lib/components/circuits/methods/CircuitTypes';
	import { createEventDispatcher } from 'svelte';

	type $$Props = NodeProps;

	export let data : NodeTemplateData;
	const pubId = data.id
	let deleteButtonShown = false
	let deleteButton : HTMLButtonElement
	let node : HTMLButtonElement

	let text = data.selected ? 'text-surface-50' : 'text-surface-700';

	const clicked = () => {
		if(!data.publishing && data.publisherId !== -1) {
			const url = `/${data.publisherId}/${pubId}`;
			window.open(url, '_blank'); // Open the URL in a new tab
		}
	}

	const checkIfMouseInsideElement = (x : number, y : number, element : DOMRect) => {
		return element.top >= y &&
			element.bottom <= y &&
			element.left <= x &&
			element.right >= x
	}

	const handleMouseLeave = (event: MouseEvent) => {
		const deleteButtonParameters: DOMRect = deleteButton?.getBoundingClientRect();
		const nodeParameters: DOMRect = node?.getBoundingClientRect();

		const insideDeleteButton = checkIfMouseInsideElement(event.x, event.y, deleteButtonParameters);
		const insideNode = checkIfMouseInsideElement(event.x, event.y, nodeParameters);

		if (!insideDeleteButton && !insideNode) {
			deleteButtonShown = false;
		}
	};

	const showDeleteButton = () => {
		if (!data.publishing || deleteButtonShown) return;
		deleteButtonShown = true
	}

	const triggerRemoval = () => {
		data.remove()
	}
</script>

	<button bind:this={deleteButton}
			on:mouseenter={showDeleteButton}
			on:mouseleave={handleMouseLeave}
			on:click="{triggerRemoval}"
			class="absolute border border-error-400 bg-surface-50 rounded-full -top-2 -left-2 px-1 py-1 transition-opacity duration-150"
			class:opacity-100={deleteButtonShown}
			class:opacity-0={!deleteButtonShown}
			class:pointer-events-none={!deleteButtonShown}
			type="button">
		<Icon icon="mdi:trashcan" class="text-md text-error-400" />
	</button>
<button bind:this={node} type="button" class="custom" on:mouseenter={showDeleteButton} on:mouseleave={handleMouseLeave} on:click="{clicked}">
	<Handle type="target" position={Position.Top} />
	<div style="  overflow-wrap: break-word;"
			class=" {text} border border-primary-500 hover:ring-2 hover:ring-primary-100 w-[180px] h-[100px] rounded-lg flex flex-col items-center justify-center gap-2 p-1 ">
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
	<Handle type="source" position={Position.Bottom}/>
</button>