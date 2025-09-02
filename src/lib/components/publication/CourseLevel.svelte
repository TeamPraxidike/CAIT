<script lang="ts">
	import Icon from '@iconify/svelte';
	import { LevelIconMap } from '$lib/util/file.js';

	export let label = "";


	function select(level: string) {
		label = level;
	}
</script>

<div class="flex gap-3">

	{#each LevelIconMap.entries() as [level, icon]}
		<button
			type="button"
			class="px-4 py-2 rounded-full border border-gray-300 text-sm flex items-center gap-2 cursor-pointer transition
			       hover:bg-gray-100 hover:text-black relative group
			       {label === level ? 'border-primary-600 border-2 text-primary-700 bg-primary-50' : 'bg-white text-gray-800'} btn-secondary"
			on:click={() => select(level)}
			title={level}
		>
			<Icon icon={icon} width="20" height="20" />
		</button>
	{/each}
</div>

<style>
    /* Optional custom tooltip (if not using title attribute) */
    .group:hover::after {
        content: attr(title);
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        background: #333;
        color: white;
        padding: 0.3rem 0.6rem;
        border-radius: 0.4rem;
        white-space: nowrap;
        font-size: 0.75rem;
        margin-top: 0.5rem;
        z-index: 10;
        opacity: 0.95;
    }
</style>
