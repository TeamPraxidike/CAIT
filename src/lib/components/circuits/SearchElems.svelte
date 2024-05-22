<script lang="ts">


	import { Grid, PublicationCard } from '$lib';
	import { onMount } from 'svelte';
	import type { Material, Publication } from '@prisma/client';

	export let materials : any = [];

</script>


	<div class="fixed top-1/2 left-1/2 w-4/5 h-4/5 max-w-4/5 max-h-4/5 bg-surface-100 shadow-lg transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center overflow-auto"><p>
		<Grid pageGrid="{false}">
			{#each materials as m}
				<PublicationCard publication="{m.publication}"></PublicationCard>
			{/each}

		</Grid>
	</p></div>
