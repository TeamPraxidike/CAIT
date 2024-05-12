<script lang="ts">
	import { PublicationCard, SearchBar } from '$lib';
	import { page } from '$app/stores';
	import { fly } from 'svelte/transition';
	import Icon from '@iconify/svelte';
	import type { Mouse } from '@playwright/test';


	let searchWord: string = '';
	$:pageType = $page.data.type;
	$: materialsText = pageType==='materials' ? 'text-surface-50 dark:text-surface-900' : 'text-primary-500'
	$: peopleText = pageType==='people' ? 'text-surface-50 dark:text-surface-900' : 'text-primary-500'
	$: circuitsText = pageType==='circuits' ? 'text-surface-50 dark:text-surface-900' : 'text-primary-500'

	$: materialsBg = pageType==='materials' ? 'bg-primary-500 dark:bg-primary-600 hover:bg-primary-500 hover:dark:bg-primary-600 hover:text-surface-50 dark:hover:text-surface-900' : 'hover:bg-primary-50 dark:hover:bg-primary-800'
	$: peopleBg = pageType==='people' ? 'bg-primary-500 dark:bg-primary-600 hover:bg-primary-500 hover:dark:bg-primary-600 hover:text-surface-50 dark:hover:text-surface-900' : 'hover:bg-primary-50 dark:hover:bg-primary-800'
	$: circuitsBg = pageType==='circuits' ? 'bg-primary-500 dark:bg-primary-600 hover:bg-primary-500 hover:dark:bg-primary-600 hover:text-surface-50 dark:hover:text-surface-900 ' : 'hover:bg-primary-50 dark:hover:bg-primary-800'


	let sortOptions:string[] = ["Most Recent", "Most Liked", "Most Used", "Oldest"]
	let sortByActive = false
	let sortByText = 'Sort By'

	const toggleSortBy = () => sortByActive = !sortByActive
	$: sortByBorder = sortByActive ? "border-primary-400" : "border-surface-400"
	const updateSortBy = (event:MouseEvent) => {
		const target = event.target as HTMLButtonElement
		sortByText = target.textContent ?? "Sort By"
		sortByActive = false;

	}

	let diffOptions:string[] = ["Easy", "Moderate", "Hard"]
	let diffActive = false
	let diffText = 'Difficulty'

	const toggleDiff = () => diffActive = !diffActive
	$: diffBorder = diffActive ? "border-primary-400" : "border-surface-400"
	const updateDiff = (event:MouseEvent) => {
		const target = event.target as HTMLButtonElement
		diffText = target.textContent ?? "Difficulty"
		diffActive = false;

	}


</script>
	<div class="col-span-4 ">
		<SearchBar searchType="materials" bind:inputKeywords={searchWord} />
	</div>

	<div class="col-span-full lg:col-span-8 flex justify-between gap-8">
		<div class="flex gap-2">
			<button class="text-xs lg:text-sm rounded-lg border border-surface-400 px-2 py-1 h-full flex items-center justify-between gap-2">
				<span class="flex-grow text-surface-700">Tags</span>
				<Icon icon="oui:arrow-right" class="text-xs text-surface-600 mt-0.5" />
			</button>
			<button class="text-xs lg:text-sm rounded-lg border border-surface-400 px-2 h-full flex items-center justify-between gap-2">
				<span class="flex-grow text-surface-700">Publisher</span>
				<Icon icon="oui:arrow-right" class="text-xs text-surface-600 mt-0.5" />
			</button>

			<!-------Difficulty-------->
			<div class="space-y-1 relative">
				<button class=" text-xs lg:text-sm rounded-lg border px-2 h-full flex items-center justify-between gap-2 hover:border-primary-400 {diffBorder}" on:click={toggleDiff}>
					<span class="flex-grow text-surface-700">{diffText}</span>
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
					<span class="flex-grow text-surface-700">{sortByText}</span>
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