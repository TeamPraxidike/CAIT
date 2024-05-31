<script lang="ts">

	export let data : any;
	import Icon from '@iconify/svelte';
</script>

<div class="bg-surface-50 border border-primary-500 w-32 h-16 rounded-lg flex flex-col items-center justify-center gap-1">
	<p class="text-surface-700">Assignment {data.id}</p>
	<div class="flex gap-2">
		<Icon icon="mdi:presentation" class="text-surface-700 text-lg self-center" />
		<Icon icon="mdi:presentation" class="text-surface-700 text-lg self-center" />
	</div>
</div>