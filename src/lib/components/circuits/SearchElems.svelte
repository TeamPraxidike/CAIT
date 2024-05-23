<script lang="ts">


	import { Grid, PublicationCard } from '$lib';
	import { createEventDispatcher, onDestroy, onMount } from 'svelte';

	export let materials : any = [];
	export let addActive: boolean = false;
	export let selectedIds: Set<number>;
	let targetDiv: HTMLDivElement;


	const removePopup = (event: MouseEvent) => {
		if (!(event.target instanceof HTMLElement)) {
			return; // Ignore if the target is not an HTMLElement
		}
		let rect = targetDiv.getBoundingClientRect();
		const isClickedInsideDiv = (
			rect.left <= event.clientX &&
			rect.right >= event.clientX &&
			rect.top <= event.clientY &&
			rect.bottom >= event.clientY
		);


		if (!isClickedInsideDiv) {
			addActive = false;
		}
	};

	onMount(() => {
		if (typeof document !== 'undefined') {
			document.addEventListener('click', removePopup);
		}
	});

	onDestroy(() => {
		if (typeof document !== 'undefined') {
			document.removeEventListener('click', removePopup);
		}
	});

	const dispatch = createEventDispatcher();
	const selectCard = (event: CustomEvent) => {
		selectedIds.add(event.detail.id);
		dispatch('selFurther', { id: event.detail.id });
	};

	const removeCard = (event: CustomEvent) => {
		selectedIds.delete(event.detail.id);
		dispatch('remFurther', { id: event.detail.id });
	};



</script>


<div bind:this={targetDiv}
		 class="fixed top-1/2 left-1/2 w-4/5 h-4/5 max-w-4/5 max-h-4/5 bg-surface-100 shadow-lg transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center overflow-auto">
		<Grid pageGrid="{false}">
			{#each materials as m}
				<PublicationCard publication="{m.publication}" inCircuits="{true}"
												 selected="{selectedIds.has(m.publication.id)}" on:selected={selectCard}
												 on:removed={removeCard} />
			{/each}
		</Grid>
</div>
