<script lang="ts">
    import {createEventDispatcher} from 'svelte';
    import Icon from '@iconify/svelte';

    export let tagText: string
    export let width: number = 0;

    export let removable: boolean;

    let dispatch = createEventDispatcher()

    const handleClick = () => dispatch("Remove", {text: tagText})
    export let onView = false;
    const tagBrowse = ()=>{
        dispatch("FilterTag", {text: tagText});
    }
</script>

{#if tagText !== ""}
    {#if onView}
    <button bind:clientWidth={width} on:click={tagBrowse}
    class="items-center gap-1 inline-flex rounded-lg py-1 px-2 whitespace-nowrap variant-soft-primary">
        <span class="text-xs">{tagText}</span>
        {#if removable}
            <button class="h-full" on:click={handleClick} aria-label="remove tag {tagText}">
                <Icon icon="mdi:remove" />
            </button>
        {/if}
    </button>
        {:else }
    <div bind:clientWidth={width}
         class="items-center gap-1 inline-flex rounded-lg py-1 px-2 whitespace-nowrap variant-soft-primary">
        <span class="text-xs">{tagText}</span>
        {#if removable}
            <button class="h-full" on:click={handleClick} aria-label="remove tag {tagText}">
                <Icon icon="mdi:remove" />
            </button>
        {/if}
    </div>
        {/if}

{/if}