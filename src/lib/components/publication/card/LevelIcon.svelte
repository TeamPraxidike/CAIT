<script lang="ts">
	import Icon from '@iconify/svelte';
	import { LevelIconMap } from '$lib/util/file.ts';
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';

	export let level: string | undefined;

	const icon = LevelIconMap.get(level ?? "") ?? "";

	let hoverDiff: HTMLDivElement;
	let isHovered = false;
	const handleHover = () => {
		isHovered = !isHovered;
	}

	onMount(()=>{
		if(hoverDiff){
			hoverDiff.addEventListener('mouseenter', handleHover);
			hoverDiff.addEventListener('mouseleave', handleHover);
		}
	})

</script>


{#if level}
	<div bind:this={hoverDiff} role="figure"  >
		<Icon icon={icon}/>
	</div>

	{#if isHovered}
		<div
			class="absolute mt-2 bg-opacity-70 shadow-sm p-2 rounded-lg items-center transition-all duration-300"
			style="z-index: 9999;" transition:fly={{ y: -8, duration: 400 }}>
			<p class="text-surface-700 dark:text-surface-200">{level}</p>
		</div>
	{/if}
{/if}