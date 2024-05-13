<script lang="ts">
	import { PublicationCard, SearchBar, Tag } from '$lib';
	import { page } from '$app/stores';
	import { fly } from 'svelte/transition';
	import Icon from '@iconify/svelte';


	let searchWord: string = '';
	$:pageType = $page.data.type;
	$: materialsText = pageType==='materials' ? 'text-surface-50 dark:text-surface-900' : 'text-primary-500'
	$: peopleText = pageType==='people' ? 'text-surface-50 dark:text-surface-900' : 'text-primary-500'
	$: circuitsText = pageType==='circuits' ? 'text-surface-50 dark:text-surface-900' : 'text-primary-500'

	$: materialsBg = pageType==='materials' ? 'bg-primary-500 dark:bg-primary-600 hover:bg-primary-500 hover:dark:bg-primary-600 hover:text-surface-50 dark:hover:text-surface-900' : 'hover:bg-primary-50 dark:hover:bg-primary-800'
	$: peopleBg = pageType==='people' ? 'bg-primary-500 dark:bg-primary-600 hover:bg-primary-500 hover:dark:bg-primary-600 hover:text-surface-50 dark:hover:text-surface-900' : 'hover:bg-primary-50 dark:hover:bg-primary-800'
	$: circuitsBg = pageType==='circuits' ? 'bg-primary-500 dark:bg-primary-600 hover:bg-primary-500 hover:dark:bg-primary-600 hover:text-surface-50 dark:hover:text-surface-900 ' : 'hover:bg-primary-50 dark:hover:bg-primary-800'

	//Variables needed to deal with Sort and Difficulty
	let sortOptions:string[] = ["Most Recent", "Most Liked", "Most Used", "Oldest"]
	let sortByActive = false
	let sortByText = 'Sort By'
	let diffOptions:string[] = ["Easy", "Moderate", "Hard"]
	let diffActive = false
	let diffText = 'Difficulty'

	//Variables needed to deal with Tags
	let selectedTags:string[] = []; //keeps track of selected tags
	let allTags:string[] = ["ANN", "CNN", "Something Else", "A very Long tag", "Another One", "Vasko", "is", "the", "best", "I"]; //array with all the tags MOCK
	let displayTags:string[] = allTags; //
	let tagActive = false
	let tagInput : HTMLInputElement;
	let tagText: string;

	//Variables needed to deal with Publishers
	let selectedPublishers:string[] = []; //keeps track of selected tags
	let allPublisherNames:string[] = ["Winston Churchill", "Franklin D. Roosevelt", "Vasko", "Bog Bezkrak", "Franklin Kostenurkata", "Goti Boti"]; //array with all the tags MOCK
	let displayPublishers:string[] = allPublisherNames; //
	let publisherActive = false
	let publisherInput : HTMLInputElement;
	let publisherText: string;


	//SORT BY Functionality

	//Used to make the dropdown appear/disappear
	const toggleSortBy = () => {
		//If sort by is active just close all the dropdowns else we first need to close down every other dropdown and then dropdown the sort by
		if (!sortByActive) {
			untoggleEverything();
			sortByActive = true;
		} else {
			untoggleEverything();
		}
	};
	//Make the border light blue showing the current toggle is active
	$: sortByBorder = sortByActive ? "border-primary-400" : "border-surface-400"

	//Updates the sortBy text for easier understanding
	const updateSortBy = (event:MouseEvent) => {
		//Take the selected option
		const target = event.target as HTMLButtonElement
		// change the text of the dropdown button
		sortByText = target.textContent ?? "Sort By"
		//close the dropdown upon selection
		sortByActive = false;
	}





	//DIFFICULTY Functionality

	//Used to make the dropdown appear/disappear
	const toggleDiff = () => {
		if (!diffActive) {
			untoggleEverything();
			diffActive = true;
		} else {
			untoggleEverything();
		}
	};
	//Make the border light blue showing the current toggle is active
	$: diffBorder = diffActive ? "border-primary-400" : "border-surface-400"
	//Updates the "Difficulty" text for easier understanding
	const updateDiff = (event:MouseEvent) => {
		//Take the selected option
		const target = event.target as HTMLButtonElement
		// change the text of the dropdown button
		diffText = target.textContent ?? 'Difficulty';
		//close the dropdown upon selection
		diffActive = false;
	}


	//TAGS functionality

	const toggleTag = () => {
		if (!tagActive) {
			untoggleEverything();
			tagActive = true;
		} else {
			untoggleEverything();
		}
	};
	$: tagBorder = tagActive ? "border-primary-400" : "border-surface-400"
	$: tagBackground = (t: string) => selectedTags.includes(t) ? 'bg-primary-100 hover:bg-primary-100' : 'hover:bg-primary-50'; //colors in light blue if the tag is already selected in the dropdown

	/*
		*Updates the selected tags and reassigns the variable
	 */
	const updateTags = (event:MouseEvent) => {
		const target = event.target as HTMLButtonElement
		let tagText = target.textContent ?? '';
		if (selectedTags.includes(tagText)){
			selectedTags = selectedTags.filter(item => item!==tagText) //if we are removing a tag remove it from selected tags
		}
		else {
			selectedTags = [...selectedTags, tagText] //if we are selecting a tag add it to the selected tags
		}
	}


	/*
		* Update the tags shown in the dropdown based on what has been inputted
	 */
	const updateFilterTags = () => {
		tagText = tagInput.value.toLowerCase() ?? ""
		if (tagText === "")
			displayTags = allTags // if there is no text display all without filtering
		else
			displayTags = allTags.filter(tag => tag.toLowerCase().includes(tagText ?? ""))
	}

	/*
		* Remove tag action called by the X on the line
	 */
	const removeTag = (event:CustomEvent) => {
		selectedTags = selectedTags.filter(item => item!==event.detail.text)
	}

	//PUBLISHER functionality

	const togglePublisher = () => {
		if (!publisherActive) {
			untoggleEverything();
			publisherActive = true;
		} else {
			untoggleEverything();
		}
	};
	$: publisherBorder = publisherActive ? 'border-primary-400' : 'border-surface-400';
	$: publisherBackground = (t: string) => selectedPublishers.includes(t) ? 'bg-primary-100 hover:bg-primary-100' : 'hover:bg-primary-50'; //colors in light blue if the tag is already selected in the dropdown

	/*
		*Updates the selected publishers and reassigns the variable
	 */
	const updatePublishers = (name: string) => {

		if (selectedPublishers.includes(name)) {
			selectedPublishers = selectedPublishers.filter(item => item !== name); //if we are removing a tag remove it from selected tags
		} else {
			selectedPublishers = [...selectedPublishers, name]; //if we are selecting a tag add it to the selected tags
		}
	};


	/*
		* Update the publishers shown in the dropdown based on what has been inputted
	 */
	const updateFilterPublishers = () => {
		publisherText = publisherInput.value.toLowerCase() ?? '';
		if (publisherText === '')
			displayPublishers = allPublisherNames; // if there is no text display all without filtering
		else
			displayPublishers = allPublisherNames.filter(name => name.toLowerCase().includes(publisherText ?? ''));
	};

	/*
		* Remove publisher action called by the X on the line
	 */
	const removePublisher = (name: string) => {
		selectedPublishers = selectedPublishers.filter(publisher => publisher !== name);
	};

	/*
	*Method that makes all the dropdowns go up; Used so whenever you dropdown a menu it closes all others
	 */
	const untoggleEverything = () => {
		sortByActive = false;
		diffActive = false;
		tagActive = false;
		publisherActive = false;
	};





</script>
	<div class="col-span-4 ">
		<SearchBar searchType="materials" bind:inputKeywords={searchWord} />
	</div>

	<div class="col-span-full lg:col-span-8 flex justify-between gap-8">
		<div class="flex gap-2">

			<!-------Tags-------->
			<div class="space-y-1 relative">
				<button class=" text-xs lg:text-sm rounded-lg border px-2 h-full flex items-center justify-between gap-2 hover:border-primary-400 {tagBorder}" on:click={toggleTag}>
					<span class="flex-grow text-surface-700 dark:text-surface-300">Tags</span>
					{#if tagActive}
						<Icon icon="oui:arrow-right" class="text-xs text-surface-600 mt-0.5 transform rotate-90 text" />
					{:else}
						<Icon icon="oui:arrow-right" class="text-xs text-surface-600 mt-0.5" />
					{/if}
				</button>
				{#if tagActive}
					<div class="absolute min-w-32 flex flex-col rounded-lg border border-surface-400 bg-surface-50" transition:fly={{ y: -8, duration: 300 }} style="z-index: 9999;">
						<input bind:this={tagInput} class="text-xs border-none rounded-lg focus:ring-0" on:input={updateFilterTags} placeholder="Search for tags"/>

						{#if displayTags.length === 0}
							<p class="p-2 text-xs text-left text-surface-600">No Matching Tags</p>
						{:else}
							{#each displayTags as tag}
								<button class="text-xs p-1 pl-2 text-left text-surface-600 w-full {tagBackground(tag)}"
												on:click={updateTags}>{tag}</button>
							{/each}
						{/if}
					</div>
				{/if}
			</div>

			<!-------Publishers-------->
			<div class="space-y-1 relative">
				<button
					class=" text-xs lg:text-sm rounded-lg border px-2 h-full flex items-center justify-between gap-2 hover:border-primary-400 {publisherBorder}"
					on:click={togglePublisher}>
					<span class="flex-grow text-surface-700 dark:text-surface-300">Publishers</span>
					{#if publisherActive}
						<Icon icon="oui:arrow-right" class="text-xs text-surface-600 mt-0.5 transform rotate-90 text" />
					{:else}
						<Icon icon="oui:arrow-right" class="text-xs text-surface-600 mt-0.5" />
					{/if}
				</button>
				{#if publisherActive}
					<div class="absolute min-w-32 flex flex-col rounded-lg border border-surface-400 bg-surface-50"
							 transition:fly={{ y: -8, duration: 300 }} style="z-index: 9999;">
						<input bind:this={publisherInput} class="text-xs border-none rounded-lg focus:ring-0"
									 on:input={updateFilterPublishers} placeholder="Search for publishers" />
						{#if displayPublishers.length === 0}
							<p class="p-2 text-xs text-left text-surface-600">No Matching Publishers</p>
						{:else}
							{#each displayPublishers as publisher}
								<button
									class="w-full h-full flex items-center gap-2 text-xs p-1 text-left text-surface-600  {publisherBackground(publisher)}"
									on:click={() => updatePublishers(publisher)}>
									<Icon class="text-surface-600 justify-self-end self-center size-6" icon="gg:profile" />
									<span class="w-full h-full">{publisher}</span>
								</button>
							{/each}
						{/if}
					</div>
				{/if}
			</div>

			<!-------Difficulty-------->
			<div class="space-y-1 relative">
				<button class=" text-xs lg:text-sm rounded-lg border px-2 h-full flex items-center justify-between gap-2 hover:border-primary-400 {diffBorder}" on:click={toggleDiff}>
					<span class="flex-grow text-surface-700 dark:text-surface-300">{diffText}</span>
					{#if diffActive}
						<Icon icon="oui:arrow-right" class="text-xs text-surface-600 mt-0.5 transform rotate-90 text" />
					{:else}
						<Icon icon="oui:arrow-right" class="text-xs text-surface-600 mt-0.5" />
					{/if}
				</button>
				{#if diffActive}
					<div class="absolute left-0 right-0 flex flex-col rounded-lg border border-surface-400 bg-surface-50" transition:fly={{ y: -8, duration: 300 }} style="z-index: 9999;">
						{#each diffOptions as dopt}
							<button class="text-xs p-1 rounded-lg hover:bg-primary-50 text-left text-surface-600" on:click={updateDiff}>{dopt}</button>
						{/each}
					</div>
				{/if}
			</div>

			<!-------SortBy-------->
			<div class="space-y-1 relative">
				<button class=" text-xs lg:text-sm rounded-lg border px-2 h-full flex items-center justify-between gap-2 hover:border-primary-400 {sortByBorder}" on:click={toggleSortBy}>
					<span class="flex-grow text-surface-700 dark:text-surface-300">{sortByText}</span>
					{#if sortByActive}
						<Icon icon="oui:arrow-right" class="text-xs text-surface-600 mt-0.5 transform rotate-90 text" />
						{:else}
						<Icon icon="oui:arrow-right" class="text-xs text-surface-600 mt-0.5" />
						{/if}
						</button>
				{#if sortByActive}
					<div class="absolute left-0 right-0 flex flex-col rounded-lg border border-surface-400 bg-surface-50" transition:fly={{ y: -8, duration: 300 }} style="z-index: 9999;">
							{#each sortOptions as sopt}
								<button class="text-xs p-1 rounded-lg hover:bg-primary-50 text-left text-surface-600" on:click={updateSortBy}>{sopt}</button>
							{/each}
					</div>
				{/if}
			</div>

		</div>



		<div class="rounded-lg flex w-1/3">
			<a href="/browse/?type=materials" class="rounded-l-lg text-xs lg:text-sm w-1/3 text-center flex justify-center items-center border-y border-l border-primary-500 dark:border-primary-600   {materialsText} {materialsBg}">Materials</a>
			<a href="/browse/?type=people" class="text-xs lg:text-sm w-1/3 text-center flex justify-center items-center border-y border-primary-500 dark:border-primary-600   {peopleText} {peopleBg}">People</a>
			<a href="/browse/?type=circuits" class="rounded-r-lg text-xs lg:text-sm w-1/3 flex justify-center items-center border-y border-r border-primary-500 dark:border-primary-600  {circuitsText} {circuitsBg}">Circuits</a>

		</div>
	</div>

<div class="col-span-full flex gap-2">
		{#if (selectedTags.length!==0)}
			<div class=" flex gap-2 items-center">
				<p class="text-xs text-surface-600 dark:text-surface-200">Tags:</p>
				{#each selectedTags as tag}
					<div>
						<Tag tagText="{tag}" width="{0}" removable="{true}" on:Remove={removeTag}/>
					</div>
				{/each}
			</div>
		{/if}

	{#if (selectedPublishers.length !== 0)}
		<div class=" flex gap-2 items-center">
			<p class="text-xs text-surface-600 dark:text-surface-200">Publishers:</p>
			{#each selectedPublishers as sp}
				<div class="flex gap-1 items-center">
					<Icon class="text-surface-600 justify-self-end self-center size-4" icon="gg:profile" />
					<p class="text-xs">{sp}</p>
					<button class="h-full" on:click={() => removePublisher(sp)}>
						<Icon icon="mdi:remove" class="text-surface-600 text-opacity-50 text-sm self-center mt-0.5" />
					</button>

				</div>
			{/each}
		</div>
	{/if}
	</div>



<PublicationCard />
<PublicationCard />
<PublicationCard />
<PublicationCard />
<PublicationCard />
<PublicationCard />
<PublicationCard />
<PublicationCard />
<PublicationCard />
<PublicationCard />