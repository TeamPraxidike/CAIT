<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import Icon from '@iconify/svelte';

    export let searchType:"materials"| "users" | "circuits" | "my publications" | "saved"
    export let inputKeywords:string
    const dispatch = createEventDispatcher()

    export let isSemanticActive: boolean;

    function toggleSemanticSearch() {
        isSemanticActive = !isSemanticActive;
    }

    const handleKeyDown = (event:KeyboardEvent) => {
        if(event.key === 'Enter'){
            searchQuery();
            event.preventDefault();
        }
    }
    function searchQuery(){
        if (isSemanticActive){
            dispatch("SemanticSearchQuery", {message: {searchType}, value:{inputKeywords}});
        }
        else{
            dispatch("SearchQuery", {message: {searchType}, value:{inputKeywords}});
        }
    }
</script>


<div class="w-full h-8 relative justify-center border border-surface-400 dark:border-surface-700 rounded-lg focus-within:ring-2 focus-within:ring-primary-300 dark:focus-within:ring-primary-700 focus-within:border-none flex">
    <!-- Search icon button -->
    <button type="button" on:click={searchQuery} aria-label="Search publications with the selected query">
        <Icon icon="ci:search-magnifying-glass" class="size-5 text-surface-500  dark:text-surface-400 pt-0.5"/>
    </button>
    <!-- Search input field -->
    <input type="text" bind:value={inputKeywords} on:keydown={handleKeyDown} class="w-11/12 rounded-lg border-none focus:ring-0 h-full dark:bg-surface-900 text-surface-800 dark:text-surface-100" placeholder="Browse {searchType}">
    <!-- Semantic Search Button -->
    <button
        type="button"
        on:click={toggleSemanticSearch}
        class="ml-auto items-center gap-1 inline-flex rounded-lg py-1 px-2 whitespace-nowrap
		{isSemanticActive
			? 'bg-primary-600 text-white dark:bg-primary-400 dark:text-surface-900 ring-2 ring-primary-300 dark:ring-primary-700 shadow-lg scale-[1.02] transition-all duration-200'
            : 'bg-surface-300 text-surface-900 dark:bg-surface-700 dark:text-surface-200 hover:bg-surface-400 dark:hover:bg-surface-600 transition-all duration-200'}"
        aria-pressed={isSemanticActive}
    >
        Semantic Search
    </button>
</div>