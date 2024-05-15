<script lang="ts">
	import Icon from '@iconify/svelte';

	export let name : string;

</script>

<button class="min-w-48 min-h-24 flex flex-col justify-center items-center border border-primary-600 bg-surface-100 shadow-md rounded-lg gap-2">
	<span class = "text-surface-600">{name}</span>
	<Icon icon="mdi:presentation" class="text-surface-600 text-lg self-center" />
</button>