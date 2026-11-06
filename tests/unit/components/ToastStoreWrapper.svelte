<!--
The toast store has to be initialized in a svelte environment.
 To get around this we use this wrapper.
 -->

<script lang="ts">
	import { initializeStores } from '@skeletonlabs/skeleton';

	initializeStores();

	export let component;
	export let props = {};
</script>

<svelte:component this={component} {...props} />