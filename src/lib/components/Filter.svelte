<script lang="ts">

	import { createEventDispatcher } from 'svelte';
	import Icon from '@iconify/svelte';
	import { fly } from 'svelte/transition';
	import FilterButton from '$lib/components/FilterButton.svelte';

	export let label: string;
	export let selected: {id:number, val:string } [];

	$: selectedIds = selected.map(x => x.id)
	$: selectedVals = selected.map(x => x.val)

	//export let selectedIds: number[];
	export let all: {id:number, val:string } [];
	export let display: {id:number, val:string } [] = all;
	export let active = false;
	let input: HTMLInputElement;

	//TODO: Change the profile pic to actual href later when we set up functionality
	export let profilePic: boolean;
	//export let text: string;

	const dispatch = createEventDispatcher();

	const toggle = () => {
		dispatch('clearSettings');
		if (!active) {
			active = true;
		}
	};
	$: border = active ? 'border-primary-400' : 'border-surface-400';


	/*
			*Updates the selected tags and reassigns the variable
	 */
	const update = (event: CustomEvent) => {

		let text = event.detail.idval.val;

		if (text.startsWith(" ")) {
			text = text.substring(1)
		}

		if (text.endsWith(" ")) {
			text = text.slice(0, -1)
		}


		if (label === "Publisher" && selectedIds.includes(event.detail.idval.id)) {
			selected = selected.filter(item => item.id !== event.detail.idval.id); //if we are removing a tag remove it from selected tags
		}
		else if (selectedVals.includes(event.detail.idval.val)){
			selected = selected.filter(item => item.val !== event.detail.idval.val); //if we are removing a tag remove it from selected tags
		}
		else {
			selected = [...selected, {id : event.detail.idval.id, val:text}]; //if we are selecting a tag add it to the selected tags
		}
	};


	/*
			* Update the tags shown in the dropdown based on what has been inputted
	 */
	const updateFilter = () => {
		let text = input.value.toLowerCase() ?? '';
		if (text === '')
			display = all; // if there is no text display all without filtering
		else
			display = all.filter(x => x.val.toLowerCase().includes(text ?? ''));
	};


</script>

<div class="space-y-1 relative">
	<button
		class=" text-xs rounded-lg border px-2 h-full flex items-center justify-between gap-2 hover:border-primary-400 {border}"
		on:click={toggle}>
		<span class="flex-grow text-surface-700 dark:text-surface-300">{label}</span>
		{#if active}
			<Icon icon="oui:arrow-right" class="text-xs text-surface-600 mt-0.5 transform rotate-90 text" />
		{:else}
			<Icon icon="oui:arrow-right" class="text-xs text-surface-600 mt-0.5" />
		{/if}
	</button>
	{#if active}
		<div class="absolute  min-w-32 flex flex-col rounded-lg border border-surface-400 bg-surface-50"
				 transition:fly={{ y: -8, duration: 300 }} style="z-index: 9999;">
			{#if all.length > 3}
				<input bind:this={input} class="text-xs dark:text-surface-600 border-none rounded-lg focus:ring-0"
							 on:input={updateFilter} placeholder="Search for {label.toLowerCase()}" />
			{/if}

			{#if display.length === 0}
				<p class="p-2 text-xs text-left text-surface-600">No Matching {label.toLowerCase()}</p>
			{:else}
				{#each display as dis, i}

<!--					<button-->
<!--						class="w-full h-full flex items-center gap-2 text-xs p-1 text-left text-surface-600 {roundingMenuItem(i, display.length)} {background(dis)}"-->
<!--						on:click={update}>-->
<!--						{#if profilePic}-->
<!--							<Icon class="text-surface-600 justify-self-end self-center size-6" icon="gg:profile" />-->
<!--						{/if}-->
<!--						<span class="w-full h-full">{dis}</span>-->
<!--					</button>-->
					<FilterButton bind:label={label} bind:selectedIds={selectedIds} bind:selectedVals={selectedVals} bind:profilePic="{profilePic}" row={i} idValue={ dis } bind:display={display} bind:selected={selected} on:update={update}/>
				{/each}
			{/if}
		</div>
	{/if}
</div>