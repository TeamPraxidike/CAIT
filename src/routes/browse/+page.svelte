<script lang="ts">
	import { MaterialTypes, Meta, PublicationCard, SearchBar, UserProp } from '$lib';
	import { goto } from '$app/navigation';
	import type { PageServerData } from './$types';
	import type { Circuit, Material, Publication, User } from '@prisma/client';
	import { onMount } from 'svelte';
	import { getExtensions } from '$lib/util/file';
	import { type PaginationSettings, Paginator } from '@skeletonlabs/skeleton';
	import DropdownSelect from '$lib/components/designSystem/DropdownSelect.svelte';
	import DropdownInput from '$lib/components/designSystem/DropdownInput.svelte';


	//let fetchPromise:Promise<any> = new Promise<null>(resolve => resolve(null));

	export let data: PageServerData;
	let searchWord: string = '';
	let materials: any[] = [];
	let circuits: any[] = [];
	let idsMat: any[] = [];
	let idsCirc: any[] = [];
	$: data.materials.then(matData => {
		materials = matData.materials;
		console.log("hui1")
	}).catch(e => {
		idsMat = [];
	});
	$: data.circuits.then(circData => {
		circuits = circData.circuits;
		console.log("pishka1")
	}).catch(e => {
		idsCirc = [];
	});
	// $: idsMat = data.idsMat
	// $: idsCirc = data.idsCirc
	$: data.materials.then(matData => {
		idsMat = matData.idsMat;
		console.log("pis222222222222222222hka1")
	}).catch(e => {
		idsMat = [];
	});
	$: data.circuits.then(circData => {
		idsCirc = circData.idsCirc;
		console.log("aaaaa")
	}).catch(e => {
		idsCirc = [];
	});
	let amount = data.amount;
	let source = data.type === 'circuits' ? idsCirc : idsMat;
	$: source = data.type === 'circuits' ? idsCirc : idsMat;
	$: paginationSettings.size = source.length;


	let users: (User & { posts: Publication[], profilePicData: string })[] = [];
	let tags = data.tags;
	//let profilePics:FetchedFileArray = data.profilePics;
	let liked = data.liked as number[];
	let saved = data.saved.saved as number[];

	$: pageType = data.type;


	//Variables needed to deal with Sort and Difficulty
	let sortOptions: string[] = ['Most Recent', 'Most Liked', 'Oldest'];
	let sortByText = 'Sort By';

	let selectedDiff: ('Easy' | 'Medium' | 'Hard')[] = [];
	let diffOptions: ('Easy' | 'Medium' | 'Hard')[] = ['Easy', 'Medium', 'Hard'];

	//Variables needed to deal with Tags
	let selectedTags: string[] = []; //keeps track of selected tags

	//Variables needed to deal with Publishers
	let selectedPublisherIDs: string[] = [];//keeps track of selected users ids
	let allPublishersObjects: { id: string, content: string }[] = users.map((x: any) => ({
		id: x.id,
		content: (x.firstName + ' ' + x.lastName)
	})); //array with all the tags MOCK

	//Variables needed to deal with Types
	let selectedTypes: string[] = []; //keeps track of selected tags
	let allTypes: string[] = MaterialTypes; //array with all the tags MOCK

	let numberNodes: string;

	const resetFilters = () => {
		page = 0;
		amount = 8;
		paginationSettings.page = 0;
		paginationSettings.limit = amount;
		selectedTags = [];
		selectedTypes = [];
		selectedPublisherIDs = [];
		selectedDiff = [];
		sendFiltersToAPI();
	};

	let fetchPromise: Promise<any> | null = null;

	const onSearch = () => {
		fetchPromise = sendFiltersToAPI();
	};

	let isSemanticActive = false;
	$: isSemanticActive = isSemanticActive;

	$: if (isSemanticActive) {
		pageType = 'semantic';
	} else {
		pageType = 'materials';
	}

	let semanticPromise: Promise<any> | null = null;

	const onSemanticSearch = () => {
		if (searchWord.trim() === '') return;
		semanticPromise = sendMessageToSemantic(searchWord);
	};

	async function sendMessageToSemantic(inputMessage: string) {
		if (!inputMessage.trim()) return;

		applyActive = false;

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
		} catch (error) {
			console.error('Error sending message:', error);

		}
	}


	async function sendFiltersToAPI() {

		applyActive = false;
		const queryParams = new URLSearchParams({
			type: pageType
		});

		if (selectedPublisherIDs.length > 0) queryParams.set('publishers', selectedPublisherIDs.join(','));

		if (selectedDiff.length > 0) queryParams.set('difficulty', selectedDiff.join(','));
		if (selectedTags.length > 0) queryParams.set('tags', selectedTags.join(','));
		if (selectedTypes.length > 0) queryParams.set('types', selectedTypes.join(','));
		if (sortByText !== 'Most Recent') queryParams.set('sort', sortByText);
		if (searchWord !== '') queryParams.set('q', searchWord);
		if (numberNodes != undefined && Number.parseInt(numberNodes) !== 0) queryParams.set('limit', numberNodes);

		const s = pageType === 'materials' ? 'material' : 'circuit';
		const url = `/api/${s}?${queryParams.toString()}`;
		materials = [];
		circuits = [];

		const res = fetch(url)
			.then(response => {
				if (!response.ok) {
					throw new Error('Network response was not ok');
				}
				return response.json();
			})
			.then(d => {
				// Handle the response data from the API
				if (s === 'material') {

					materials = d.materials;
					idsMat = d.idsMat;
				} else {
					circuits = d.circuits;
					idsCirc = d.idsCirc;
				}
				amount = 8;
				page = 0;
				paginationSettings.size = amount;
				paginationSettings.page = 0;

			})
			.catch(error => {
				console.error('There was a problem with the fetch operation:', error);
			});

		console.log(res)

		return res;
	};

	let page = 0;

	function onPageChange(e: CustomEvent): void {
		page = e.detail;
		materials = [];
		circuits = [];
		changePage(amount, page);
	}

	function onAmountChange(e: CustomEvent): void {
		materials = [];
		circuits = [];
		amount = e.detail;
		changePage(amount, page);
	}

	const changePage = async (amount: number, pageNum: number) => {
		const ids = pageType === 'materials' ? idsMat : idsCirc;
		const queryParams = new URLSearchParams({
			type: pageType,
			ids: ids.slice(pageNum * amount, (pageNum + 1) * amount).join(',')
		});
		const s = pageType === 'materials' ? 'material' : 'circuit';
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
				if (s === 'material') {
					materials = data.publications.map((x: Publication & {
						materials: Material & { files: string[] },
						coverPicData: string,
						publisher: User & { profilePicData: string }
					}) => ({
						id: x.materials.id,
						publication: x,
						coverPicData: x.coverPicData,
						publisher: x.publisher,
						files: x.materials.files,
						encapsulatingType: x.materials.encapsulatingType
					}));
				} else {
					circuits = data.publications.map((x: Publication & {
						circuit: Circuit,
						coverPicData: string,
						publisher: User & { profilePicData: string }
					}) => ({ id: x.circuit.id, publication: x, coverPicData: x.coverPicData, publisher: x.publisher }));
				}
			})
			.catch(error => {
				console.error('There was a problem with the fetch operation:', error);
			});
	};


	let applyActive = false;
	$:applyBackground = applyActive ? 'bg-primary-600  hover:bg-opacity-75' : 'bg-surface-400';

	const deleteFilters = (pageType: string) => {
		if (pageType !== 'materials') {
			page = 0;
			amount = 8;
			paginationSettings.page = 0;
			paginationSettings.limit = amount;
			selectedTags = [];
			selectedTypes = [];
			selectedPublisherIDs = [];
			selectedDiff = [];
		}


	};

	$: deleteFilters(pageType);

	onMount(async () => {
		users = (await data.users).users;
		allPublishersObjects = users.map((x: any) => ({
			id: x.id,
			content: (x.firstName + ' ' + x.lastName)
		}));

		if (data.selectedTag !== '') {
			applyActive = true;
			selectedTags = [];
			selectedTags.push(data.selectedTag);
			sendFiltersToAPI();
		}
	});

	let paginationSettings = {
		page: 0,
		limit: amount,
		size: source.length,
		amounts: [4, 8, 12, 16, 32]
	} satisfies PaginationSettings;

	/**
	 * Will switch to a specific query page based on pageType.
	 * This option toggles the semantic search off as it is meant to
	 * only switch to either materials, circuits or people.
	 *
	 */
	const switchToBrowsePage = () => {
		goto(`/browse/?type=${pageType}`);
		isSemanticActive = false;
		amount = 8;
		paginationSettings.limit = amount;
		paginationSettings.page = 0;
	};

</script>

<Meta title="Browse" description="Browse CAIT publications - slides, videos, exam questions etc." type="website" />

<div class="col-span-full mt-32">
	<SearchBar searchType="materials" bind:isSemanticActive={isSemanticActive} bind:inputKeywords={searchWord}
			   on:press={() => applyActive = true}
			   on:SearchQuery={onSearch} on:SemanticSearchQuery={onSemanticSearch} />
</div>

<div class="col-span-3 border-gray-700">
	<DropdownSelect title="Type" multiselect={false} options={["materials", "people", "circuits"]}
					bind:selected={pageType} on:select={switchToBrowsePage} />
	<DropdownSelect title="Sort By" multiselect={false} options={sortOptions}
					bind:selected={sortByText} on:select={() => applyActive = true} />

	{#if pageType !== "people"}
		<DropdownSelect title="Difficulty" multiselect={true} options={diffOptions}
						bind:selected={selectedDiff} on:select={() => applyActive = true} />
		<DropdownSelect title="Tags" multiselect={true} options={tags.map(x => x.content)}
						bind:selected={selectedTags} on:select={() => applyActive = true} />
		<DropdownSelect title="Publisher" multiselect={true}
						options={allPublishersObjects.map(x => x.id)}
						overwriteDisplays={allPublishersObjects.map(x => x.content)}
						bind:selected={selectedPublisherIDs} on:select={() => applyActive = true} />
	{/if}

	{#if pageType === 'materials'}
		<DropdownSelect title="Types" multiselect={true} options={allTypes}
						bind:selected={selectedTypes} on:select={() => applyActive = true} />
	{/if}

	{#if pageType === 'circuits'}
		<DropdownInput title="Minimum nodes:"
					   bind:content={numberNodes} on:select={() => applyActive = true} />
	{/if}
	<button class="w-full rounded-lg text-xs py-1.5 px-3 text-surface-100 shadow-lg {applyBackground}"
			on:click={onSearch} disabled="{!applyActive}">Search
	</button>
	{#if (selectedTypes.length !== 0) || (selectedPublisherIDs.length !== 0) || (selectedDiff.length !== 0) || (selectedTags.length !== 0)}
		<button
			class="w-full px-2 p-1 text-xs bg-primary-300 rounded-lg text-primary-50 hover:bg-opacity-75"
			on:click={resetFilters}>
			Reset Filters
		</button>
	{/if}
</div>

<div class="col-span-9">
	<!--{#if fetchPromise === null}-->
		agiokjhbasergb
		{#if pageType === "materials"}
			{#await fetchPromise || data.materials}
				<p>Loading materials...</p>
			{:then materialsAwaited}
				{#each materials as material (material.id)}
					<PublicationCard extensions="{getExtensions(material)}"
									 imgSrc={material.coverPicData}
									 publication={material.publication}
									 liked={liked.includes(material.publication.id)}
									 saved={saved.includes(material.publication.id)}
									 materialType={material.encapsulatingType}
									 publisher={material.publisher}
					/>
				{/each}
			{:catch error}
				<!--TODO: Change color-->
				<p style="color: red">Error while loading materials. Reload the page to try again</p>
			{/await}
		{:else if pageType === "people"}
			{#await fetchPromise || data.users}
				<p>Loading users...</p>
			{:then usersAwaited}
				{#each users as person (person.id)}
					<UserProp view="search" posts="{person.posts.length}"
							  userPhotoUrl={person.profilePicData} role="Maintainer" user={person} />
				{/each}
			{:catch error}
				<!--TODO: Change color-->
				<p style="color: red">Error while loading users. Reload the page to try again</p>
			{/await}
		{:else if pageType === "circuits"}
			{#await fetchPromise ||  data.circuits}
				<p>Loading circuits...</p>
			{:then circuitsAwaited}
				{#each circuits as circuit (circuit.id)}
					<PublicationCard publication="{circuit.publication}"
									 imgSrc={circuit.coverPicData}
									 liked={liked.includes(circuit.publication.id)}
									 saved={saved.includes(circuit.publication.id)}
									 publisher={circuit.publisher} />
				{/each}
			{:catch error}
				<!--TODO: Change color-->
				<p style="color: red">Error while loading circuits. Reload the page to try again</p>
			{/await}
		{:else if isSemanticActive && semanticPromise !== null}
			{#await semanticPromise}
				<p>Loading results...</p>
			{:then semanticResultsAwaited}
				<div class="col-span-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
					{#each semanticResultsAwaited as message}
						<div
							class="w-full flex flex-col gap-3 p-4 border border-surface-300 dark:border-surface-700 rounded-lg shadow bg-surface-100 dark:bg-surface-800">
							<p class="italic text-surface-600 dark:text-surface-300">"...{message.content}..."</p>
							<p class="text-sm text-surface-800 dark:text-surface-100">Name of file:
								<b>{message.fileTitle}</b></p>
							<p class="text-xs text-surface-600 dark:text-surface-400"><i>You can find this file in:</i>
							</p>
							<PublicationCard
								extensions="{getExtensions(message)}"
								imgSrc={message.coverPicData}
								publication={message.publication}
								liked={false}
								saved={false}
								materialType={message.encapsulatingType}
								publisher={message.publisher}
							/>
						</div>

					{:else}
						<p class="col-span-full text-center text-surface-600 dark:text-surface-400">
							No results found
						</p>

					{/each}
				</div>


			{:catch error}
				<!--TODO: Change color-->
				<p style="color: red">Error while loading semantic search results. Reload the page to try again</p>
			{/await}
		{/if}
	<!--{:else}-->
	<!--	hui-->
	<!--	{#if pageType === "materials"}-->
	<!--		{#await fetchPromise}-->
	<!--			<p>Loading materials...</p>-->
	<!--		{:then materialsAwaited}-->
	<!--			{#each materials as material (material.id)}-->
	<!--				<PublicationCard extensions="{getExtensions(material)}"-->
	<!--								 imgSrc={material.coverPicData}-->
	<!--								 publication={material.publication}-->
	<!--								 liked={liked.includes(material.publication.id)}-->
	<!--								 saved={saved.includes(material.publication.id)}-->
	<!--								 materialType={material.encapsulatingType}-->
	<!--								 publisher={material.publisher}-->
	<!--				/>-->
	<!--			{/each}-->
	<!--		{:catch error}-->
	<!--			&lt;!&ndash;TODO: Change color&ndash;&gt;-->
	<!--			<p style="color: red">Error while loading materials. Reload the page to try again</p>-->
	<!--		{/await}-->
	<!--	{:else if pageType === "people"}-->
	<!--		{#await fetchPromise}-->
	<!--			<p>Loading users...</p>-->
	<!--		{:then usersAwaited}-->
	<!--			{#each users as person (person.id)}-->
	<!--				<UserProp view="search" posts="{person.posts.length}"-->
	<!--						  userPhotoUrl={person.profilePicData} role="Maintainer" user={person} />-->
	<!--			{/each}-->
	<!--		{:catch error}-->
	<!--			&lt;!&ndash;TODO: Change color&ndash;&gt;-->
	<!--			<p style="color: red">Error while loading users. Reload the page to try again</p>-->
	<!--		{/await}-->
	<!--	{:else if pageType === "circuits"}-->
	<!--		{#await fetchPromise}-->
	<!--			<p>Loading circuits...</p>-->
	<!--		{:then circuitsAwaited}-->
	<!--			{#each circuits as circuit (circuit.id)}-->
	<!--				<PublicationCard publication="{circuit.publication}"-->
	<!--								 imgSrc={circuit.coverPicData}-->
	<!--								 liked={liked.includes(circuit.publication.id)}-->
	<!--								 saved={saved.includes(circuit.publication.id)}-->
	<!--								 publisher={circuit.publisher} />-->
	<!--			{/each}-->
	<!--		{:catch error}-->
	<!--			&lt;!&ndash;TODO: Change color&ndash;&gt;-->
	<!--			<p style="color: red">Error while loading circuits. Reload the page to try again</p>-->
	<!--		{/await}-->
	<!--	{:else if isSemanticActive && semanticPromise !== null}-->
	<!--		{#await semanticPromise}-->
	<!--			<p>Loading results...</p>-->
	<!--		{:then semanticResultsAwaited}-->
	<!--			<div class="col-span-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">-->
	<!--				{#each semanticResultsAwaited as message}-->
	<!--					<div-->
	<!--						class="w-full flex flex-col gap-3 p-4 border border-surface-300 dark:border-surface-700 rounded-lg shadow bg-surface-100 dark:bg-surface-800">-->
	<!--						<p class="italic text-surface-600 dark:text-surface-300">"...{message.content}..."</p>-->
	<!--						<p class="text-sm text-surface-800 dark:text-surface-100">Name of file:-->
	<!--							<b>{message.fileTitle}</b></p>-->
	<!--						<p class="text-xs text-surface-600 dark:text-surface-400"><i>You can find this file in:</i>-->
	<!--						</p>-->
	<!--						<PublicationCard-->
	<!--							extensions="{getExtensions(message)}"-->
	<!--							imgSrc={message.coverPicData}-->
	<!--							publication={message.publication}-->
	<!--							liked={false}-->
	<!--							saved={false}-->
	<!--							materialType={message.encapsulatingType}-->
	<!--							publisher={message.publisher}-->
	<!--						/>-->
	<!--					</div>-->
	<!--				{/each}-->
	<!--			</div>-->


	<!--		{:catch error}-->
	<!--			&lt;!&ndash;TODO: Change color&ndash;&gt;-->
	<!--			<p style="color: red">Error while loading semantic search results. Reload the page to try again</p>-->
	<!--		{/await}-->
	<!--	{/if}-->
	<!--{/if}-->
</div>

<!-- Display the data when the promise is resolved -->
<!--TODO: Please for the love of god refactor this-->

{#if pageType !== 'people'}
	<div class="col-span-full">
		<Paginator
			separatorText="ass"
			bind:settings={paginationSettings}
			showFirstLastButtons="{true}"
			showPreviousNextButtons="{true}"
			on:page={onPageChange} on:amount={onAmountChange}
		/>
	</div>
{/if}
