<script lang="ts">
    import {createEventDispatcher} from "svelte";
    import Icon from '@iconify/svelte';

    export let searchType:"materials"| "users" | "circuits" | "my publications" | "saved"
    export let inputKeywords:string
    const dispatch = createEventDispatcher()
    function searchQuery(){
        dispatch("SearchQuery", {message: {searchType}, value:{inputKeywords}})
        //TODO: perform query and update the page I do not know where this method would go either here or on page, not sure
    }
</script>


<div class="w-full h-8 relative justify-center border border-surface-400 dark:border-surface-700 rounded-lg focus-within:ring-2 focus-within:ring-primary-300 dark:focus-within:ring-primary-700 focus-within:border-none flex">
    <!-- Search icon button -->
    <button on:click={searchQuery} class="">
        <Icon icon="ci:search-magnifying-glass" class="size-6 text-surface-600 dark:text-surface-400 pl-2"/>
    </button>
    <!-- Search input field -->
    <input on:input={searchQuery} type="text" bind:value={inputKeywords} class="w-11/12 rounded-lg border-none focus:ring-0 h-full dark:bg-surface-900 text-surface-800 dark:text-surface-100" placeholder="Browse {searchType}">

</div>