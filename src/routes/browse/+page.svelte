<script lang="ts">
	import { MaterialTypes, Meta, PublicationCard, SearchBar, UserProp } from '$lib';
	import { goto } from '$app/navigation';
	import type { PageServerData } from './$types';
	import type { Publication, User, Course } from '@prisma/client';
	import { onMount } from 'svelte';
	import {type PaginationSettings, Paginator, ProgressRadial, SlideToggle} from '@skeletonlabs/skeleton';
	import DropdownSelect from '$lib/components/designSystem/DropdownSelect.svelte';
	import DropdownInput from '$lib/components/designSystem/DropdownInput.svelte';
	import {semanticSearchActive} from '$lib/stores/semanticSearchActive'
	import CourseCard from '$lib/components/CourseCard.svelte';
	import { BROWSABLE_PAGE_TYPES, PageType, toPageType } from '$lib/util/frontendTypes';

	export let data: PageServerData;
	let searchWord: string = '';
	let materials: any[] = [];
	let circuits: any[] = [];
	let idsMat: any[] = [];
	let idsCirc: any[] = [];
	

	let amount = data.amount;
	let source = data.type === 'circuits' ? idsCirc : idsMat;
	$: paginationSettings.size = data.type === 'circuits' ? idsCirc.length : idsMat.length;


	let users: (User & { posts: Publication[], profilePicData: string })[] = [];
	let courses: (Course& {coverPic: {data: string, fileId: string} })[] = [];
	let tags = data.tags;
	let liked = data.liked as number[];
	let saved = data.saved.saved as number[];



	let pageType: PageType = toPageType(data.type);
	$: pageType = toPageType(data.type);
	let sortOptions: string[] = ['Most Recent', 'Most Liked', 'Oldest'];
	let sortByText = 'Sort By';
	let selectedDiff: ('Easy' | 'Medium' | 'Hard')[] = [];
	let diffOptions: ('Easy' | 'Medium' | 'Hard')[] = ['Easy', 'Medium', 'Hard'];
	let selectedTags: string[] = [];

	let selectedPublisherIDs: string[] = [];//keeps track of selected users ids
	let allPublishersObjects: { id: string, content: string }[] = users.map((x: any) => ({
		id: x.id,
		content: (x.firstName + ' ' + x.lastName)
	}));

	let selectedTypes: string[] = [];
	let allTypes: string[] = MaterialTypes;

	let numberNodes: string;

	const resetFilters = () => {
		// Todo: discuss expected behaviour
		// page = 0;
		// amount = 9;
		// paginationSettings.page = 0;
		// paginationSettings.limit = amount;
		selectedTags = [];
		selectedTypes = [];
		selectedPublisherIDs = [];
		selectedDiff = [];
		searchActive=true;
	};

	let fetchPromise: Promise<any> | null = null;

	const onSearch = () => {

		if (isSemanticActive) {
			onSemanticSearch();
		} else {
			fetchPromise = sendFiltersToAPI();
		}
	};

	let isSemanticActive = false;
	$: isSemanticActive = isSemanticActive;

	let lastPaginationType: PageType = pageType;

	$: if (isSemanticActive) {
		lastPaginationType = pageType
		pageType = PageType.SEMANTIC;
		// updates the store so we close all open dropdowns
		$semanticSearchActive = true;
	}
	$: if (!isSemanticActive) {
		pageType = lastPaginationType;
		$semanticSearchActive = false;
	}

	let semanticPromise: Promise<any> | null = null;

	const onSemanticSearch = () => {
		if (searchWord.trim() === '') return;
		semanticPromise = sendMessageToSemantic(searchWord);
	};

	async function sendMessageToSemantic(inputMessage: string) {
		if (!inputMessage.trim()) return;
		searchActive = false;

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
		searchActive = false;
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

		const s = pageType === PageType.MATERIALS ? 'material' : 'circuit';
		const url = `/api/${s}?${queryParams.toString()}`;
		// materials = [];
		// circuits = [];

		return fetch(url)
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
					source = idsMat
				} else {
					circuits = d.circuits;
					idsCirc = d.idsCirc;
					source = idsCirc;
				}
				page = 0;
				paginationSettings.page = 0;
			})
			.catch(error => {
				console.error('There was a problem with the fetch operation:', error);
			});
	}

	let page = 0;

	function onPageChange(e: CustomEvent): void {
		page = e.detail;
		// materials = [];
		// circuits = [];
		fetchPromise = changePage(amount, page);
	}

	function onAmountChange(e: CustomEvent): void {
		// materials = [];
		// circuits = [];
		amount = e.detail;
		page = 0;
		fetchPromise = changePage(amount, page);
	}

	async function changePage(amount: number, pageNum: number) {
		const ids = pageType === PageType.MATERIALS ? idsMat : idsCirc;
		const queryParams = new URLSearchParams({
			type: pageType,
			ids: ids.slice(pageNum * amount, (pageNum + 1) * amount).join(',')
		});

		if (sortByText !== 'Most Recent') queryParams.set('sort', sortByText);

		const s = pageType === PageType.MATERIALS ? 'material' : 'circuit';
		const url = `/api/publication/set?${queryParams.toString()}`;
		// materials = [];
		// circuits = [];
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
					materials = data.publications.map(x => ({
						id: x.materials.id,
						publication: x,
						coverPicData: x.coverPicData,
						publisher: x.publisher,
						encapsulatingType: x.materials.encapsulatingType
					}));
				} else {
					circuits = data.publications.map(x => ({
						id: x.circuit.id,
						publication: x,
						coverPicData: x.coverPicData,
						publisher: x.publisher
					}));
				}
			})
			.catch(error => {
				console.error('There was a problem with the fetch operation:', error);
			});
	};

	let searchActive = false;
	$:applyBackground = searchActive ? 'bg-primary-600  hover:bg-opacity-75' : 'bg-surface-400';

	// const deleteFilters = (pageType: string) => {
	// 	if (pageType !== 'materials') {
	// 		page = 0;
	// 		amount = 9;
	// 		paginationSettings.page = 0;
	// 		paginationSettings.limit = amount;
	// 		selectedTags = [];
	// 		selectedTypes = [];
	// 		selectedPublisherIDs = [];
	// 		selectedDiff = [];
	// 	}
	// };
	//
	// $: deleteFilters(pageType);

	onMount(async () => {
		users = (await data.users).users;
		
		allPublishersObjects = users.map((x: any) => ({
			id: x.id,
			content: (x.firstName + ' ' + x.lastName)
		}));

		courses = (await data.courses);


		if (data.selectedTag !== '') {
			searchActive = true;
			selectedTags = [];
			selectedTags.push(data.selectedTag);
			fetchPromise = sendFiltersToAPI();
		}

		data.materials.then((matData) => {

			materials = matData.materials;
			idsMat = matData.idsMat;
			if (data.type !== 'circuits') source = idsMat;
		}).catch((err) =>{
			materials = [];
			idsMat = [];
		});

		data.circuits.then((circData) => {
			circuits = circData.circuits;
			idsCirc = circData.idsCirc;
			if (data.type === 'circuits') source = idsCirc;
		}).catch((err) =>{
			circuits = [];
			idsCirc = [];
		});
	});

	let paginationSettings = {
		page: 0,
		limit: amount,
		size: source.length,
		// amounts: [4, 8, 12, 16, 32]
		amounts: [9, 18, 36]
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
		amount = 9;
		paginationSettings.limit = amount;
		paginationSettings.page = 0;
		resetFilters();
	};
</script>

<Meta title="Browse" description="Browse CAIT publications - slides, videos, exam questions etc." type="website" />

<div class="col-span-full mt-24">
	<SearchBar searchType={pageType} bind:isSemanticActive={isSemanticActive} bind:inputKeywords={searchWord}
			   on:press={() => searchActive = true}
			   on:SearchQuery={onSearch} on:SemanticSearchQuery={onSemanticSearch} />
</div>

<div class="col-span-3 border-gray-700">

	<div class="flex">
		<div>
			<span>Semantic Search<sup class="text-xs text-gray-500">Beta</sup> </span> <br>
			<span class="text-surface-500 text-sm"><i>Semantically search over file contents</i></span>
		</div>
		<SlideToggle
			bind:checked={isSemanticActive}
			label="Semantic Search"
			class="mb-4"
			name="semantic-search"
			size="sm"
		/>
	</div>

	<DropdownSelect title="Type" multiselect={false} options={BROWSABLE_PAGE_TYPES}
					bind:selected={pageType} on:select={switchToBrowsePage} disabled={isSemanticActive} />
	<DropdownSelect title="Sort By" multiselect={false} options={sortOptions}
					bind:selected={sortByText} on:select={() => searchActive = true} disabled={isSemanticActive} />

	{#if pageType !== PageType.PEOPLE}
<!--		<DropdownSelect title="Education Level" multiselect={true} options={diffOptions}-->
<!--						bind:selected={selectedDiff} on:select={() => searchActive = true}-->
<!--						disabled={isSemanticActive}/>-->
		<DropdownSelect title="Tags" multiselect={true} options={tags.map(x => x.content)}
						bind:selected={selectedTags} on:select={() => searchActive = true}
						disabled={isSemanticActive}/>
		<DropdownSelect title="Publisher" multiselect={true}
						options={allPublishersObjects.map(x => x.id)}
						overwriteDisplays={allPublishersObjects.map(x => x.content)}
						bind:selected={selectedPublisherIDs} on:select={() => searchActive = true}
						disabled={isSemanticActive}/>
	{/if}

	{#if pageType === PageType.MATERIALS}
		<DropdownSelect title="Content" multiselect={true} options={allTypes}
						bind:selected={selectedTypes} on:select={() => searchActive = true}
						disabled={isSemanticActive}/>
	{/if}

	<!--{#if pageType === 'circuits'}-->
	<!--	<DropdownInput title="Minimum nodes:"-->
	<!--				   bind:content={numberNodes} on:select={() => searchActive = true} />-->
	<!--{/if}-->
	<button class="w-full rounded-sm py-1.5 px-3 text-surface-100 shadow-lg {applyBackground}"
			on:click={onSearch} disabled="{!searchActive}">
		Search
	</button>
	{#if (selectedTypes.length !== 0) || (selectedPublisherIDs.length !== 0) || (selectedDiff.length !== 0) || (selectedTags.length !== 0)}
		<button
			class="w-full px-2 p-1 text-xs bg-primary-300 rounded-lg text-primary-50 hover:bg-opacity-75"
			on:click={resetFilters}>
			Reset Filters
		</button>
	{/if}
</div>

<div class="col-span-9 grid grid-cols-3 gap-2 auto-rows-min">
	{#if (pageType !== PageType.PEOPLE) && (pageType !== PageType.SEMANTIC) }
		<div class="col-span-full">
			<Paginator
				bind:settings={paginationSettings}
				showFirstLastButtons="{true}"
				showPreviousNextButtons="{true}"
				on:page={onPageChange} on:amount={onAmountChange}
			/>
		</div>
	{/if}
	{#if pageType === PageType.MATERIALS}
		{#await fetchPromise || data.materials}
			<div class="flex flex-row gap-2">
				<p>Loading materials...</p>
				<ProgressRadial font={8} width="w-8" class="shrink-0" />
			</div>
		{:then materialsAwaited}
			{#each materials as material (material.id)}
<!--				<PublicationCard extensions="{getExtensions(material)}"-->
				<PublicationCard imgSrc={material.coverPicData}
								 publication={material.publication}
								 liked={liked.includes(material.publication.id)}
								 saved={saved.includes(material.publication.id)}
								 materialType={material.encapsulatingType}
								 publisher={material.publisher}
								 className="col-span-1"
				/>
			{/each}
		{:catch _}
			<!--TODO: Change color-->
			<p style="color: red">Error while loading materials. Reload the page to try again</p>
		{/await}
	{:else if pageType === PageType.PEOPLE}
		{#await fetchPromise || data.users}
			<div class="flex flex-row gap-2">
				<p>Loading users...</p>
				<ProgressRadial font={8} width="w-8" class="shrink-0" />
			</div>
		{:then _}
			{#each users as person (person.id)}
				<UserProp view="search" posts="{person.posts.length}"
						  className="col-span-1"
						  userPhotoUrl={person.profilePicData} role="Maintainer" user={person} />
			{/each}
		{:catch _}
			<!--TODO: Change color-->
			<p style="color: red">Error while loading users. Reload the page to try again</p>
		{/await}
	{:else if pageType === PageType.CIRCUITS}
		{#await fetchPromise || data.circuits}
			<div class="flex flex-row gap-2">
				<p>Loading circuits...</p>
				<ProgressRadial font={8} width="w-8" class="shrink-0" />
			</div>
		{:then _}
			{#each circuits as circuit (circuit.id)}
				<PublicationCard publication="{circuit.publication}"
								 imgSrc={circuit.coverPicData}
								 liked={liked.includes(circuit.publication.id)}
								 saved={saved.includes(circuit.publication.id)}
								 publisher={circuit.publisher}
								 className="col-span-1"
				/>
			{/each}
		{:catch error}
			<!--TODO: Change color-->
			<p style="color: red">Error while loading circuits. Reload the page to try again</p>
		{/await}
	{:else if pageType === PageType.COURSES}
		{#await fetchPromise || data.courses}
			<div class="flex flex-row gap-2">
				<p>Loading courses...</p>
				<ProgressRadial font={8} width="w-8" class="shrink-0" />
			</div>
		{:then _}
			{#each courses as course (course.id)}
				<CourseCard course={course} 
						  className="col-span-1"
						  coursePhotoUrl={course.coverPic.data}></CourseCard>
				
			{/each}
		{:catch _}
			<!--TODO: Change color-->
			<p style="color: red">Error while loading users. Reload the page to try again</p>
		{/await}
	{:else if isSemanticActive && semanticPromise !== null}
		{#await semanticPromise}
			<div class="flex flex-row gap-2">
				<p>Loading results...</p>
				<ProgressRadial font={8} width="w-8" class="shrink-0" />
			</div>
		{:then semanticResultsAwaited}
			{#each semanticResultsAwaited as message}
				<div
					class="col-span-full w-full flex flex-col gap-3 p-4 border border-surface-300 dark:border-surface-700 rounded-lg shadow bg-surface-100 dark:bg-surface-800">
					<div>
						<p class="text-sm text-surface-800 dark:text-surface-100 font-bold">Name of file:
							{message.fileTitle}
						</p>
						<p class="italic p-4 bg-gray-100 text-surface-600 dark:text-surface-300">
							"...{message.content}..."
						</p>
						<p class="text-xs text-surface-600 dark:text-surface-400 italic">
							You can find this file in:
						</p>
					</div>
					<div class="flex justify-between">
						<span>
							{message.publication.title} by {message.publisher.firstName} {message.publisher.lastName}
						</span>
						<a href="/{message.publisher.username}/{message.publication.id}"
						   class="text-primary-600 dark:text-primary-400 hover:underline">
							Go to publication
						</a>
					</div>
				</div>

			{:else}
				<p class="col-span-full text-center text-surface-600 dark:text-surface-400">
					No results found
				</p>

			{/each}

		{:catch error}
			<!--TODO: Change color-->
			<p style="color: red">Error while loading semantic search results. Reload the page to try again</p>
		{/await}
	{/if}
</div>

