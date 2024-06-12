<script lang="ts">

	import { createEventDispatcher, onDestroy, onMount } from 'svelte';
	import Icon from '@iconify/svelte';
	import { fly } from 'svelte/transition';
	import FilterButton from '$lib/components/FilterButton.svelte';
	import type { User } from '@prisma/client';

	export let people: (User & {profilePicData: string})[] = []
	export let label: string;
	export let selected: {id:number, content:string } [];

	$: selectedIds = selected.map(x => x.id)
	$: selectedVals = selected.map(x => x.content)

	//export let selectedIds: number[];
	export let all: {id:number, content:string } [];

	export let num: number;
	export let type: boolean = false;
	export let display: {id:number, content:string } [] = all;
	export let active = false;
	let input: HTMLInputElement;

	export let oneAllowed : boolean = false;
	export let selectedOption : string = "";

	let nodes: HTMLInputElement;

	$: overflow = display.length>10 ? "overflow-y-scroll" : "overflow-y-hidden";

	//TODO: Change the profile pic to actual href later when we set up functionality
	export let profilePic: boolean;
	//export let text: string;
	let targetDiv: HTMLDivElement;
	let targetButton: HTMLButtonElement;

	const removePopup = (event: MouseEvent) => {
		if (!(event.target instanceof HTMLElement)) {
			return; // Ignore if the target is not an HTMLElement
		}
		const isClickedInsideDiv = oneAllowed ? targetButton.contains(event.target) : targetDiv.contains(event.target);
		if (!isClickedInsideDiv)
			active = false;
	}
	onMount(() => {
		document.addEventListener('click', removePopup);
	});

	onDestroy(() => {
		if (typeof document !== 'undefined') {
			document.removeEventListener('click', removePopup);
		}	} )

	const dispatch = createEventDispatcher();

	const toggle = () => {
		dispatch('clearSettings');
		if (!active) {
			active = true;
			nodes?.blur();
		}
	};
	$: text = active ? 'text-primary-800 font-semibold' : 'text-surface-800';


	/*
			*Updates the selected tags and reassigns the variable
	 */
	const update = (event: CustomEvent) => {

		let text = event.detail.idval.content;

		if (text.startsWith(" ")) {
			text = text.substring(1)
		}

		if (text.endsWith(" ")) {
			text = text.slice(0, -1)
		}

		if (oneAllowed){
			selectedOption = text
			active = false
		}
		else {
			if (label === "Publisher" && selectedIds.includes(event.detail.idval.id)) {
				selected = selected.filter(item => item.id !== event.detail.idval.id); //if we are removing a tag remove it from selected tags
			}
			else if (selectedVals.includes(event.detail.idval.content)){
				selected = selected.filter(item => item.content !== event.detail.idval.content); //if we are removing a tag remove it from selected tags
			}
			else {
				selected = [...selected, {id : event.detail.idval.id, content:text}]; //if we are selecting a tag add it to the selected tags
			}
		}

		dispatch('filterSelected');
	};


	/*
			* Update the tags shown in the dropdown based on what has been inputted
	 */
	const updateFilter = () => {
		let text = oneAllowed ? (input.value ?? '') : (input.value.toLowerCase() ?? '');
		if (text === '')
			display = all; // if there is no text display all without filtering
		else
			display = all.filter(x => x.content.toLowerCase().includes(text ?? ''));
	};


</script>

<div bind:this={targetDiv}   class="space-y-1 relative">
	{#if type}
		<button class="flex rounded-lg py-2 px-2 gap-1 items-center shadow-md border-none hover:font-semibold" on:click={() => {nodes.focus()}}>
			<span class="text-xs {text}">{label}:</span>
			<input  bind:this={nodes} class="text-xs h-4 bg-surface-50 border-none w-4 focus:ring-0 px-0"
						 type="number" name="nodes" bind:value={num} min="0" on:input={() => {dispatch("filterSelected")}}/>
		</button>

	{:else}
		<button bind:this={targetButton}  type = "button"
						class=" hover:font-semibold text-xs rounded-lg py-2 px-2 h-full flex items-center justify-between gap-2 shadow-md"
						on:click={toggle}>
			<span class="flex-grow {text}">{oneAllowed ? selectedOption : label}</span>
			{#if active}
				<Icon icon="oui:arrow-right" class="text-xs {text} mt-0.5 transform rotate-90 text" />
			{:else}
				<Icon icon="oui:arrow-right" class="text-xs {text} mt-0.5" />
			{/if}
		</button>
	{/if}
	{#if active}
		<div class="absolute  min-w-32 flex flex-col rounded-lg shadow-lg bg-surface-50"
				 transition:fly={{ y: -8, duration: 300 }} style="z-index: 9999;">
			{#if all.length > 10}
				<input  bind:this={input} class="text-xs dark:text-surface-600 border-none rounded-lg focus:ring-0"
							 on:input={updateFilter} placeholder="Search for {label.toLowerCase()}" />
			{/if}

			{#if display.length === 0}
				<p class="p-2 text-xs text-left text-surface-600">No Matching {label.toLowerCase()}</p>
			{:else}
				<div class="max-h-64 {overflow}">
					{#if label === 'Publisher'}
						{#each people as dis, i}
							<FilterButton profilePicData={dis.profilePicData} bind:label={label} bind:selectedIds={selectedIds} bind:selectedVals={selectedVals} bind:profilePic="{profilePic}" row={i} idValue={{id: i, content: dis.firstName + "" + dis.lastName  }} bind:display={display} on:update={update}/>
						{/each}
						{:else }
					{#each display as dis, i}
						<FilterButton bind:label={label} bind:selectedIds={selectedIds} bind:selectedVals={selectedVals} bind:profilePic="{profilePic}" row={i} idValue={ dis } bind:display={display} on:update={update}/>
					{/each}
						{/if}
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
    /* For Chrome, Safari, Edge, Opera */
    input[type="number"]::-webkit-outer-spin-button,
    input[type="number"]::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }

    /* For Firefox */
    input[type="number"] {
        -moz-appearance: textfield;
    }
</style>