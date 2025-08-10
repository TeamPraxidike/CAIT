<script lang="ts">
	import Icon from '@iconify/svelte';

	export let label = "";

	const levels = [
		{ label: 'Bachelor', icon: 'mdi:school' },
		{ label: 'Master', icon: 'mdi:account-school' },
		{ label: 'PhD', icon: 'mdi:brain' }
	];

	function select(level: string) {
		label = level;
	}
</script>

<div class="flex gap-3">

	{#each levels as level}
		<button
			type="button"
			class="px-4 py-2 rounded-full border text-sm flex items-center gap-2 cursor-pointer transition
			       hover:bg-gray-100 relative group
			       {label === level.label ? 'bg-primary-100 border-primary-500' : 'border-gray-300'} btn-secondary"
			on:click={() => select(level.label)}
			title={level.label}
		>
			<Icon icon={level.icon} width="20" height="20" />
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
