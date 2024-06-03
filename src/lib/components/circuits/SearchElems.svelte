<script lang="ts">
	import { Grid, PublicationCard, SearchBar } from '$lib';
	import { createEventDispatcher, onDestroy, onMount } from 'svelte';
	import ToggleComponent from '$lib/components/ToggleComponent.svelte';
	import type { FetchedFileArray } from '$lib/database';
	import { page } from '$app/stores';

	import { scale } from 'svelte/transition';
	export let materials : any = [];
	export let fileData : FetchedFileArray = []
	export let addActive: boolean = false;
	export let selectedIds: Set<number>;

	let userIds : string[] = []
	let targetDiv: HTMLDivElement;
	let searchWord : string = ""

	// function getFileExtension(filePath: string): string {
	// 	const index = filePath.lastIndexOf('.');
	// 	return index !== -1 ? filePath.substring(index + 1) : '';
	// }


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

	const onSearch = (event : CustomEvent) => {
		searchWord = event.detail.value.inputKeywords
		searchAPI()
	}

	const newMaterials = (event : CustomEvent) => {

		if (event.detail.option === 0)
			userIds = []
		if (event.detail.option === 2){
			if ($page.data.session?.user.id)
				userIds = [$page.data.session?.user.id]
		}

		searchAPI()
	}

	const searchAPI = async () => {
		const queryParams = new URLSearchParams({
			publishers: userIds.join(','),
			q: searchWord
		});
		const url = `/api/material?${queryParams.toString()}`;

		// Make a GET request to the API
		await fetch(url)
			.then(response => {
				if (!response.ok) {
					throw new Error('Network response was not ok');
				}
				return response.json();
			})
			.then(data => {
				console.log(data)
			// Handle the response data from the API
				materials = data.materials
				console.log(materials)
				fileData = data.fileData
			})
			.catch(error => {
				console.error('There was a problem with the fetch operation:', error);
			});
	}




</script>

<div class="fixed top-0 left-0 w-full h-full bg-surface-800 bg-opacity-70"/>
	<div bind:this={targetDiv}
			 class="fixed top-1/2 left-1/2 w-4/5 h-4/5 bg-surface-100 rounded-lg shadow-lg transform -translate-x-1/2 -translate-y-1/2 flex overflow-auto items-start"  transition:scale={{ delay: 0, duration: 200, start:0.9}}>
		<Grid pageGrid="{false}">

			<div class="flex-col col-span-full mt-8">
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


			{#each materials as m, i}
				<PublicationCard publication="{m.publication}" inCircuits="{true}"
												 selected="{selectedIds.has(m.publication.id)}" on:selected={selectCard}
												 on:removed={removeCard} imgSrc={'data:image;base64,' + fileData[i].data} liked="{false}" saved="{false}"/>
			{/each}
		</Grid>
	</div>