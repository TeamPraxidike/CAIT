<script lang="ts">
    import Icon from '@iconify/svelte';
    import { createEventDispatcher } from 'svelte';

    export let tagText:string;
    export let width:number;

    export let removable:boolean

    let dispatch = createEventDispatcher()

    const handleClick = () => dispatch("Remove", {text: tagText})
</script>



<div bind:clientWidth={width} class="flex items-center gap-1 bg-primary-50 bg-opacity-50 dark:bg-primary-400 dark:bg-opacity-25 inline-flex rounded-lg py-1 px-2  border border-surface-200 dark:border-surface-600 whitespace-nowrap" >
    <p class="dark:text-surface-100 text-xs text-primary-500 text-opacity-50 dark:text-primary-300 ">{tagText}</p>
    {#if removable}
        <button class="h-full" on:click={handleClick}>
            <Icon icon="mdi:remove" class="text-primary-700 text-opacity-50 text-xs" />
        </button>
    {/if}
</div>
