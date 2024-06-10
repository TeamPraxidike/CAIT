<script lang="ts">
	import { Grid, PublicationCard, SearchBar } from '$lib';
	import { createEventDispatcher, onDestroy, onMount } from 'svelte';
	import ToggleComponent from '$lib/components/ToggleComponent.svelte';
	import { page } from '$app/stores';

	import { scale } from 'svelte/transition';
	import type { Material, Publication } from '@prisma/client';
	export let materials : any = [];
	let circuits : any = [];
	let publications: any = [];
	export let addActive: boolean = false;
	export let selectedIds: Set<number>;

	let userIds: string[] = [];
	let targetDiv: HTMLDivElement;
	let searchWord : string = ""
	let urlParam = "material"
	let chosenOption = 0

	export let liked: number[];
	export let saved: number[];

	const likedToggled = (event:CustomEvent) => {

		const id = event.detail.id;
		if (liked.includes(id)) {
			liked = liked.filter((i) => i !== id);
		} else {
			liked.push(id);
		}
	}

	const savedToggled = (event:CustomEvent) => {
		const id = event.detail.id;
		if (saved.includes(id)) {
			saved = saved.filter((i) => i !== id);
		} else {
			saved.push(id);
		}
	}





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

	const onSearch = (event: CustomEvent) => {
		searchWord = event.detail.value.inputKeywords;
		searchAPI();
	};

	const newMaterials = (event: CustomEvent) => {

		if (event.detail.option === 0)
		{
			console.log("All Materials")
			chosenOption = 0
			userIds = []
			urlParam = "material"
		}
		if (event.detail.option === 1) {
			chosenOption = 1
			userIds = []
			urlParam = "circuit"
		}
		if (event.detail.option === 2){
			chosenOption = 2
			if ($page.data.session?.user.id)
				userIds = [$page.data.session?.user.id]
			urlParam = "publication"
		}
		if (event.detail.option === 3){
			chosenOption = 3
			if ($page.data.session?.user.id)
				userIds = [$page.data.session?.user.id]
			urlParam = `user/${$page.data.session?.user.id}/saved`
			console.log(urlParam)
		}

		searchAPI();
	};

	const searchAPI = async () => {

		const queryParams = new URLSearchParams({
			publishers: userIds.join(','),
			q: searchWord,
			fullPublications: "true"
		});
		const url = `/api/${urlParam}?${queryParams.toString()}`;
		// Make a GET request to the API
		await fetch(url)
			.then(response => {
				if (!response.ok) {
					throw new Error('Network response was not ok');
				}
				return response.json();
			})
			.then(data => {
			// Handle the response data from the API
				if (chosenOption === 0)
				{
					materials = []
					materials = data.materials
				}
				if (chosenOption === 1)
				{
					circuits = []
					circuits = data
				}
				if (chosenOption === 2)
				{
					publications = []
					publications = data.publications
				}
				if (chosenOption === 3)
				{
					publications = []
					publications = data.saved
				}



			})
			.catch(error => {
				console.error('There was a problem with the fetch operation:', error);
			});
	};


</script>

<div class="fixed top-0 left-0 w-full h-full bg-surface-800 bg-opacity-70"/>
	<div bind:this={targetDiv}
			 class="fixed top-1/2 left-1/2 w-4/5 h-4/5 bg-surface-100 rounded-lg shadow-lg transform -translate-x-1/2 -translate-y-1/2 flex overflow-auto items-start"  transition:scale={{ delay: 0, duration: 200, start:0.9}} style="z-index: 999">
		<Grid pageGrid="{false}">

			<div class="flex-col col-span-full mt-8 ">
				<div class="flex justify-between w-full">
					<h2 class="text-surface-700 font-bold mb-4">Select Publications to Add to Your Circuit</h2>
					<button type="button" class="rounded-lg py-1 px-3 bg-surface-800 text-surface-50" on:click="{() => {addActive = false}}">Done</button>
				</div>
				<div class = "w-full lg:w-7/12 xl:w-1/2 mb-2">
					<SearchBar searchType="materials" bind:inputKeywords={searchWord} on:SearchQuery={onSearch}/>
				</div>
				<div class="hidden rounded-lg lg:flex w-full lg:w-7/12 xl:w-1/2 h-8 mb-8">
					<ToggleComponent page="{false}" pageType="All Materials" options={["All Materials", "All Circuits", "My Publications", "Saved Publications"]}
													 labels={["All Materials", "All Circuits", "My Publications", "Saved Publications"]} on:reset={newMaterials} />
				</div>
			</div>

			{#if chosenOption === 0}
				{#each materials as m}
					<PublicationCard publication="{m.publication}" inCircuits="{true}"
													 selected="{selectedIds.has(m.publication.id)}" on:selected={selectCard}
													 on:removed={removeCard} imgSrc={'data:image;base64,' + m.coverPicData} liked={liked.includes(m.publication.id)} saved={saved.includes(m.publication.id)} on:liked={likedToggled} on:saved={savedToggled} publisher={m.publisher}/>
				{/each}
				{:else if chosenOption===1}
					{#each circuits as m}
					<PublicationCard publication="{m.publication}" inCircuits="{true}"
					selected="{selectedIds.has(m.publication.id)}" on:selected={selectCard}
					on:removed={removeCard} imgSrc={'data:image;base64,' + m.coverPicData} liked={liked.includes(m.publication.id)} saved={saved.includes(m.publication.id)} on:liked={likedToggled} on:saved={savedToggled} publisher={m.publisher}/>
					{/each}
			{:else if (chosenOption===2 || chosenOption===3)}
				{#each publications as p}
					<PublicationCard publication="{p}" inCircuits="{true}"
													 selected="{selectedIds.has(p.id)}" on:selected={selectCard}
													 on:removed={removeCard} imgSrc={'data:image;base64,' + p.coverPicData} liked={liked.includes(p.id)} saved={saved.includes(p.id)} on:liked={likedToggled} on:saved={savedToggled} publisher={p.publisher}/>
				{/each}
			{/if}

	</Grid>
</div>