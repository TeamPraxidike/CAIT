<script lang="ts">
	import { slide } from "svelte/transition"
	import { createEventDispatcher } from 'svelte';
	import {semanticSearchActive} from "$lib/stores/semanticSearchActive.ts";

	export let title: string = "";
	export let options:string[] = [];
	export let multiselect: boolean = false;
	export let selected: string[]|string = [];
	export let overwriteDisplays: string[]|null = null;
	export let disabled: boolean = false;

	export let searchable: boolean = false;
	export let maxHeight: string = '12rem';

	let open = false;
	let lastOpen: boolean = false;

	export let searchTerm: string = '';

	// keep those separate (no else if)
	// otherwise both will rerun because open is on the RHS
	$: if ($semanticSearchActive === true) {
		lastOpen = open;
		open = false;
	}
	$: if ($semanticSearchActive === false){
		open = lastOpen;
	}

	$: opened = options.map(option => {
		if (multiselect) {
			return Array.isArray(selected) && selected.includes(option);
		} else {
			return selected === option;
		}
	});

	$: displayedOptions = searchTerm.trim() === ''
		? options
		: options.filter(o => o.toLowerCase().includes(searchTerm.toLowerCase()));

	const dispatch = createEventDispatcher();
	function toggleDropdown() { open = !open; if (!open) searchTerm = ''; }
	function selectOption(option: string) {
		if (multiselect) {
			if (Array.isArray(selected) && selected.includes(option)) {
				opened[options.indexOf(option)] = false;
				selected = (selected as string[]).filter(o => o !== option);
			} else {
				opened[options.indexOf(option)] = true;
				selected = Array.isArray(selected) ? [...(selected as string[]), option] : [option];
			}
		} else {
			selected = option;
			opened = options.map(() => false);
			opened[options.indexOf(option)] = true;
			open = false;
		}
		dispatch('select', {option});
	}
</script>

<div role="combobox"
	 aria-controls="dropdown-listbox"
	 aria-expanded={open}
	 aria-haspopup="listbox"
	 aria-disabled={disabled}
>
	<button
		id="dropdown-button"
		class="text-md w-full bg-surface-200 border px-3 py-2 text-left
			{disabled ? 'cursor-not-allowed text-surface-300' : ''}"
		aria-haspopup="listbox"
		aria-expanded={open}
		on:click={toggleDropdown}
		type="button"
		disabled={disabled}
	>
		{title}
	</button>
	{#if open}
		<ul
			id="dropdown-listbox"
			class="w-full"
			transition:slide={{ duration: 200 }}
			role="listbox"
			aria-multiselectable={multiselect}
			style="max-height: {maxHeight}; overflow-y: auto;"
		>
		{#if searchable}
			<li class="px-3 py-2">
				<input
					type="text"
					placeholder="Search..."
					bind:value={searchTerm}
					class="w-full bg-surface-100 border px-2 py-1"
				/>
			</li>
		{/if}

		{#if displayedOptions.length === 0}
			<li class="px-3 py-2 text-sm text-surface-500">No results</li>
		{:else}
			{#each displayedOptions as option}
				<li
					class="border text-sm px-3 py-2 flex items-center"
					role="option"
					aria-selected={opened[options.indexOf(option)]}
				>
					<button
						type="button"
						class="w-full text-left flex items-center cursor-pointer hover:bg-gray-100"
						on:click={() => selectOption(option)}
						tabindex="0"
					>
						{#if multiselect}
							<input
								type="checkbox"
								checked={opened[options.indexOf(option)]}
								class="mr-2"
								tabindex="-1"
							/>
						{/if}
						<span class={!multiselect && opened[options.indexOf(option)] ? 'font-bold' : ''}>
							{overwriteDisplays ? overwriteDisplays[options.indexOf(option)] : option}
						</span>
					</button>
				</li>
			{/each}
		{/if}
		</ul>
	{/if}
</div>

<style>
    ul[role="listbox"] {
        position: static;
        z-index: 1;
    }
</style>

