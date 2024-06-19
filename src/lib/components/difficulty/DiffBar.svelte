<script lang="ts">

    import { fly } from 'svelte/transition';
    import { onMount } from 'svelte';
    export let diff:'hard'|'medium'|'easy';
    export let className:string = "h-6 w-6";

    let colour:string;
    $: switch(diff) {
        case 'hard':
            colour = "bg-error-400"
            break
        case "easy":
            colour = "bg-green-500"
            break
        case "medium":
            colour = "bg-amber-400"
            break
    }



    let hoverDiff: HTMLDivElement;
    let isHovered = false;
    const handleHover = () => {
        isHovered = !isHovered;
    }

    $: third = diff === 'hard' ? colour : 'bg-none'

    onMount(()=>{
        if(hoverDiff){
            hoverDiff.addEventListener('mouseenter', handleHover);
            hoverDiff.addEventListener('mouseleave', handleHover);
        }
    })

</script>

<div class="relative">
    <div bind:this={hoverDiff} role="figure" class="flex items-end justify-between space-x-0.5 {className}"  >
        <div class="flex-auto border dark:border-surface-50 border-surface-900 dark:border-opacity-60 border-opacity-60 {colour} h-1/2 rounded-lg"></div>
        <div class="flex-auto border dark:border-surface-50 border-surface-900 dark:border-opacity-60 border-opacity-60 {diff === 'hard' || diff==='medium' ? colour : 'bg-none'} h-3/4 rounded-lg"></div>
        <div class="flex-auto border dark:border-surface-50 border-surface-900 {third} dark:border-opacity-60 border-opacity-60 h-full rounded-lg"></div>
    </div>

    {#if isHovered}
        <div
          class="absolute mt-2 {colour} bg-opacity-70 shadow-sm p-2 rounded-lg items-center transition-all duration-300"
          style="z-index: 9999;" transition:fly={{ y: -8, duration: 400 }}>
            <p class="text-surface-700">{diff}</p>
        </div>
    {/if}
</div>


