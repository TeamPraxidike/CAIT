<script lang="ts">
	export let list: string[] = [];

	// If not Learning Objective then it is Prior Knowledge
	export let isLO: boolean;

	const title = isLO ? "Learning Objectives" : "Prior Knowledge";
	const emptyMessage = isLO ? "No learning objectives have been indicated" : "No prior knowledge has been indicated";
</script>

<div class="flex flex-col">
	<span class="font-bold text-surface-800">{title}:</span>
	<ul class="list-inside break-words">
		{#if list.length === 0}
			<li class="break-words">{emptyMessage}</li>
		{:else}
			{#each list as listItem}
				<li class="list text-surface-700 text-sm list-disc break-words">{listItem}</li>
			{/each}
		{/if}
	</ul>
</div>