<script lang="ts">
	import { slide } from "svelte/transition"
	import { createEventDispatcher } from 'svelte';

	export let title: string = "";
	export let options:string[] = [];
	export let multiselect: boolean = false;
	export let selected: string[]|string = [];
	export let overwriteDisplays: string[]|null = null;

	let open = false;

	$: opened = options.map(option => {
		if (multiselect) {
			return Array.isArray(selected) && selected.includes(option);
		} else {
			return selected === option;
		}
	});

	const dispatch = createEventDispatcher();
	function toggleDropdown() { open = !open; }
	function selectOption(option: string) {
		if (multiselect) {
			if (selected.includes(option)) {
				opened[options.indexOf(option)] = false;
				selected = (selected as string[]).filter(o => o !== option);
			} else {
				opened[options.indexOf(option)] = true;
				selected = [...selected, option];
			}
		} else {
			selected = option;
			opened = options.map(() => false);
			opened[options.indexOf(option)] = true;
		}
		dispatch('select', {option});
	}
</script>

<div role="combobox"
	 aria-controls="dropdown-listbox"
	 aria-expanded={open}
	 aria-haspopup="listbox"
>
	<button
		id="dropdown-button"
		class="text-md w-full bg-surface-200 border px-3 py-2 text-left"
		aria-haspopup="listbox"
		aria-expanded={open}
		on:click={toggleDropdown}
		type="button"
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
		>
			{#each options as option, i}
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
							{overwriteDisplays ? overwriteDisplays[i] : option}
						</span>
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
    ul[role="listbox"] {
        position: static;
        z-index: 1;
    }
</style>

