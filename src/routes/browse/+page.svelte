<script lang="ts">
	import { PublicationCard, SearchBar } from '$lib';
	import { page } from '$app/stores';
	import Icon from '@iconify/svelte';


	let searchWord: string = '';
	$:pageType = $page.data.type;
	$: materialsText = pageType==='materials' ? 'text-surface-50 dark:text-surface-900' : 'text-primary-500'
	$: peopleText = pageType==='people' ? 'text-surface-50 dark:text-surface-900' : 'text-primary-500'
	$: circuitsText = pageType==='circuits' ? 'text-surface-50 dark:text-surface-900' : 'text-primary-500'

	$: materialsBg = pageType==='materials' ? 'bg-primary-500 dark:bg-primary-600 hover:bg-primary-500 hover:dark:bg-primary-600 hover:text-surface-50 dark:hover:text-surface-900' : 'hover:bg-primary-50 dark:hover:bg-primary-800'
	$: peopleBg = pageType==='people' ? 'bg-primary-500 dark:bg-primary-600 hover:bg-primary-500 hover:dark:bg-primary-600 hover:text-surface-50 dark:hover:text-surface-900' : 'hover:bg-primary-50 dark:hover:bg-primary-800'
	$: circuitsBg = pageType==='circuits' ? 'bg-primary-500 dark:bg-primary-600 hover:bg-primary-500 hover:dark:bg-primary-600 hover:text-surface-50 dark:hover:text-surface-900 ' : 'hover:bg-primary-50 dark:hover:bg-primary-800'


</script>
	<div class="col-span-4 ">
		<SearchBar searchType="materials" bind:inputKeywords={searchWord} />
	</div>

	<div class="col-span-full lg:col-span-8 flex justify-between gap-8">
		<div class="flex gap-2">
			<button class="text-xs lg:text-sm rounded-lg border border-surface-400 px-2 py-1 h-full flex items-center justify-between gap-2">
				<span class="flex-grow">Tags</span>
				<Icon icon="oui:arrow-right" class="text-xs text-surface-600 mt-0.5" />
			</button>
			<button class="text-xs lg:text-sm rounded-lg border border-surface-400 px-2 h-full flex items-center justify-between gap-2">
				<span class="flex-grow">Publisher</span>
				<Icon icon="oui:arrow-right" class="text-xs text-surface-600 mt-0.5" />
			</button>
			<button class="text-xs lg:text-sm rounded-lg border border-surface-400 px-2 h-full flex items-center justify-between gap-2">
				<span class="flex-grow">Difficulty</span>
				<Icon icon="oui:arrow-right" class="text-xs text-surface-600 mt-0.5" />
			</button>
			<button class="text-xs lg:text-sm rounded-lg border border-surface-400 px-2 h-full flex items-center justify-between gap-2">
				<span class="flex-grow">Sort By</span>
				<Icon icon="oui:arrow-right" class="text-xs text-surface-600 mt-0.5" />
			</button>
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