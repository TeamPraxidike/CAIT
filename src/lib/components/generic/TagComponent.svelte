<script lang="ts">
    import {createEventDispatcher} from 'svelte';
    import Icon from '@iconify/svelte';

    export let tagText: string
    export let width: number = 0;

    export let removable: boolean = false;

    let dispatch = createEventDispatcher()

    const handleClick = () => dispatch("Remove", {text: tagText})

</script>

{#if tagText !== ""}
    <div bind:clientWidth={width}
         class="chip items-center gap-1 bg-primary-50 bg-opacity-50 dark:bg-primary-400 dark:bg-opacity-25 inline-flex rounded-lg py-1 px-2  border border-surface-200 dark:border-surface-600 whitespace-nowrap">
        <span class="text-xs text-primary-500 dark:text-primary-300 ">{tagText}</span>
        {#if removable}
            <button class="h-full" on:click={handleClick}>
                <Icon icon="mdi:remove" class="text-primary-700 dark:text-primary-300 text-opacity-50 text-xs"/>
            </button>
        {/if}
    </div>
{/if}