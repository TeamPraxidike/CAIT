<script lang="ts">

	import type { PopupSettings } from '@skeletonlabs/skeleton';
	import { popup } from '@skeletonlabs/skeleton';

	export let data : any;
	import Icon from '@iconify/svelte';

	const popupHoverPub: PopupSettings = {
		event: 'hover',
		target: 'popupHoverPub',
		placement: 'top'
	};
</script>

<button use:popup="{popupHoverPub}" on:click={() => {alert("Haha")}} class="bg-surface-50 border border-primary-500 w-[100px] h-[60px] rounded-lg flex flex-col items-center justify-center gap-1">
	<p class="text-surface-700">{data}</p>
	<div class="flex gap-2">
		<Icon icon="mdi:presentation" class="text-surface-700 text-lg self-center" />
		<Icon icon="mdi:presentation" class="text-surface-700 text-lg self-center" />
	</div>
</button>

<div class="card p-4 variant-filled-secondary" data-popup="popupHoverPub">
	<p>Hover Content</p>
	<div class="arrow variant-filled-secondary" />
</div>