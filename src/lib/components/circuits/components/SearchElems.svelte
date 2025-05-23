<script lang="ts">
	import { Grid, PublicationCard, SearchBar } from '$lib';
	import { createEventDispatcher, onDestroy, onMount } from 'svelte';
	import ToggleComponent from '$lib/components/ToggleComponent.svelte';
	import { page } from '$app/stores';

	import { scale } from 'svelte/transition';
	import {
		type Circuit,
		type Material,
		MaterialType,
		type Publication,
		PublicationType,
		type User
	} from '@prisma/client';
	import { getExtensions } from '$lib/util/file';
	import { type PaginationSettings, Paginator } from '@skeletonlabs/skeleton';
	export let materials : any = [];
	export let source : number[] = []
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
					source = data.idsMat
				}
				if (chosenOption === 1)
				{
					circuits = []
					circuits = data.circuits
					source = data.idsCirc

				}
				if (chosenOption === 2)
				{

					publications = []
					publications = data.publications
					source = data.ids
				}
				if (chosenOption === 3)
				{
					publications = []
					publications = data.saved
					source = data.ids
					console.log(data)
				}
				amount = 8
				p = 0
				paginationSettings.limit = amount
				paginationSettings.size = source.length
				paginationSettings.page = 0
			})
			.catch(error => {
				console.error('There was a problem with the fetch operation:', error);
			});
	};

	function onPageChange(e: CustomEvent): void {
		p = e.detail;
		changePage(amount, p)
	}

	function onAmountChange(e: CustomEvent): void {

		amount = e.detail;
		changePage(amount, p)
	}

	const changePage = async(amount: number, pageNum:number) => {
		const queryParams = new URLSearchParams();
		queryParams.set("ids", source.slice(pageNum * amount, (pageNum+1)*amount).join(','))
		const url = `/api/publication/set?${queryParams.toString()}`;
		materials = [];
		circuits = [];
		//Make a GET request to the API
		return fetch(url)
			.then(response => {
				if (!response.ok) {
					throw new Error('Network response was not ok');
				}
				return response.json();
			})
			.then(data => {
				// Handle the response data from the API
				if (chosenOption === 0) {
					materials = data.publications.map((x:Publication&{materials: Material & {files:string[]}, coverPicData:string, publisher:User & { profilePicData: string }}) => ({id: x.materials.id, publication: x, coverPicData: x.coverPicData, publisher:x.publisher, files:x.materials.files, encapsulatingType:x.materials.encapsulatingType}));
				} else if (chosenOption === 1){
					circuits = data.publications.map((x : Publication&{circuit: Circuit, coverPicData:string, publisher:User & { profilePicData: string }})=> ({id: x.circuit.id, publication: x, coverPicData: x.coverPicData, publisher:x.publisher}));
				}
				else {
					publications = data.publications
				}
			})
			.catch(error => {
				console.error('There was a problem with the fetch operation:', error);
			});
	}

	let amount = 8
	let p = 0

	let paginationSettings = {
		page: 0,
		limit: amount,
		size: source.length,
		amounts: [4,8,12,16,32],
	} satisfies PaginationSettings;

	const switchPage = () => {
		amount = 8
		paginationSettings.limit = amount
		paginationSettings.page = 0
	}

	let isSemanticActive = false;
	$: isSemanticActive = isSemanticActive;

	let semanticPromise: Promise<any> | null = null;

	const onSemanticSearch = (event : CustomEvent) => {
		let semanticSearchQuery = event.detail.value.inputKeywords;
		semanticPromise = sendMessageToSemantic(semanticSearchQuery)
	}

	async function sendMessageToSemantic(inputMessage: string) {
		if (!inputMessage.trim()) return;

		//searchActive = false;

		const messageToSend = inputMessage.trim();

		try {
			const response = await fetch('/api/semanticsearch', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ message: messageToSend })
			});

			if (!response.ok) {
				throw new Error('Failed to get response');
			}

			const rJson = await response.json();

			return rJson.results;

			// if (!rJson.results || !Array.isArray(rJson.results) || rJson.results.length === 0) {
			// 	throw new Error('No results returned');
			// }



		} catch (error) {
			console.error('Error sending message:', error);

		}
	}

	$: if (isSemanticActive){
		chosenOption = 4;
	} else {
		chosenOption = 0;
	}


</script>

<div class="fixed top-0 left-0 w-full h-full bg-surface-800 bg-opacity-70"/>
	<div bind:this={targetDiv}
			 class="fixed top-1/2 left-1/2 w-4/5 h-4/5 bg-surface-100 dark:bg-surface-900 rounded-lg shadow-lg transform -translate-x-1/2 -translate-y-1/2 flex overflow-auto items-start"  transition:scale={{ delay: 0, duration: 200, start:0.9}} style="z-index: 999">
		<Grid pageGrid="{false}">
			<button type="button" class="col-start-4 mt-4 md:hidden rounded-lg py-1 px-3 bg-surface-800 dark:bg-surface-600 hover:bg-opacity-75 text-surface-50" on:click="{() => {addActive = false}}">Done</button>

			<div class="flex-col col-span-full mt-8 ">
				<div class="flex justify-between w-full">
					<h2 class="text-surface-700 dark:text-surface-300 font-bold mb-4">Select Publications to Add to Your Circuit</h2>
					<button type="button" class="hidden md:block rounded-lg py-1 px-3 bg-surface-800 dark:bg-surface-600 hover:bg-opacity-75 text-surface-50" on:click="{() => {addActive = false}}">Done</button>
				</div>
				<div class = "w-full lg:w-7/12 xl:w-1/2 mb-2">
					<SearchBar searchType="materials" bind:isSemanticActive={isSemanticActive} bind:inputKeywords={searchWord} on:SearchQuery={onSearch} on:SemanticSearchQuery={onSemanticSearch}/>
				</div>
				<div class=" rounded-lg flex w-full lg:w-7/12 xl:w-1/2 h-8 mb-8">
					<ToggleComponent page="{false}" pageType="All Materials" options={["All Materials", "All Circuits", "My Publications", "Saved Publications"]}
													 labels={["All Materials", "All Circuits", "My Publications", "Saved Publications"]} on:reset={newMaterials} />
				</div>
			</div>
<!--TODO: Ei tuka si e ebalo maikata ot inconsistencies (compared with browse page), please fix			-->
			{#if chosenOption === 0}
				{#each materials as m}
					<PublicationCard publication="{m.publication}" inCircuits="{true}"
													 extensions="{getExtensions(m)}"
													 selected="{selectedIds.has(m.publication.id)}" on:selected={selectCard}
													 on:removed={removeCard} imgSrc={m.coverPicData} liked={liked.includes(m.publication.id)} saved={saved.includes(m.publication.id)} on:liked={likedToggled} on:saved={savedToggled} publisher={m.publisher} materialType={m.encapsulatingType}/>
				{/each}
				{:else if chosenOption===1}
					{#each circuits as m}
					<PublicationCard publication="{m.publication}" inCircuits="{true}"
					selected="{selectedIds.has(m.publication.id)}" on:selected={selectCard}
					on:removed={removeCard} imgSrc={m.coverPicData} liked={liked.includes(m.publication.id)} saved={saved.includes(m.publication.id)} on:liked={likedToggled} on:saved={savedToggled} publisher={m.publisher}/>
					{/each}
			{:else if (chosenOption===2 || chosenOption===3)}
				{#each publications as p}
					<PublicationCard publication="{p}" inCircuits="{true}"
													 extensions="{getExtensions(p.materials)}"
													 selected="{selectedIds.has(p.id)}" on:selected={selectCard}
													 on:removed={removeCard} imgSrc={p.coverPicData} liked={liked.includes(p.id)} saved={saved.includes(p.id)} on:liked={likedToggled} on:saved={savedToggled} publisher={p.publisher} materialType={p.type === PublicationType.Circuit ? MaterialType.other: p.materials.encapsulatingType}/>

				{/each}
			{:else if isSemanticActive && semanticPromise !== null}
				{#await semanticPromise}
					<p>Loading results...</p>
				{:then semanticResultsAwaited}
					<div class="col-span-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
						{#each semanticResultsAwaited as message}
							<div class="w-full flex flex-col gap-3 p-4 border border-surface-300 dark:border-surface-700 rounded-lg shadow bg-surface-100 dark:bg-surface-800">
								<p class="italic text-surface-600 dark:text-surface-300">"...{message.content}..."</p>
								<p class="text-sm text-surface-800 dark:text-surface-100">Name of file: <b>{message.fileTitle}</b></p>
								<p class="text-xs text-surface-600 dark:text-surface-400"><i>You can find this file in:</i></p>
								<PublicationCard
									inCircuits="{true}"
									publication="{message.publication}"
									extensions="{getExtensions(message)}"
									selected="{selectedIds.has(message.publication.id)}" on:selected={selectCard}
									on:removed={removeCard} imgSrc={message.coverPicData}
									liked={liked.includes(message.publication.id)}
									saved={saved.includes(message.publication.id)}
									on:liked={likedToggled} on:saved={savedToggled}
									publisher={message.publisher} materialType={message.encapsulatingType}/>
							</div>
						{/each}
					</div>


				{:catch error}
					<!--TODO: Change color-->
					<p style="color: red">Error while loading semantic search results. Reload the page to try again</p>
				{/await}
			{/if}
			<button type="button" class="col-start-4 my-4 md:hidden rounded-lg py-1 px-3 bg-surface-800 dark:bg-surface-600 hover:bg-opacity-75 text-surface-50" on:click="{() => {addActive = false}}">Done</button>
			{#if source.length > 4}
				<div class="col-span-full">
					<Paginator
						bind:settings={paginationSettings}
						showFirstLastButtons="{true}"
						showPreviousNextButtons="{true}"
						on:page={onPageChange} on:amount={onAmountChange}
					/>
				</div>
			{/if}

		</Grid>

</div>