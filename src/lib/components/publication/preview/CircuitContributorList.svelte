<script lang="ts">
	import { Avatar } from '@skeletonlabs/skeleton';
	import { slide } from 'svelte/transition';

	type Contributor = {
		publisherId?: string;
		username: string;
		profilePicData?: string | null;
	};

	export let contributors: Contributor[] = [];

	let expanded = false;
	const contentId = 'circuit-contributor-list';

	const getInitials = (name: string): string => {
		return name
			.trim()
			.split(/\s+/)
			.map((part) => part[0]?.toUpperCase() ?? '')
			.join('')
			.slice(0, 2);
	};

	$: uniqueContributors = Array.from(
		new Map(
			contributors
				.filter((c) => c.username?.trim().length > 0)
				.map((c) => [c.publisherId ?? c.username, c])
		).values()
	);
</script>

<div class="flex flex-col gap-2">
	<button
		type="button"
		class="w-fit text-sm font-medium text-primary-600 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/60 rounded"
		aria-expanded={expanded}
		aria-controls={contentId}
		on:click={() => (expanded = !expanded)}
	>
		{expanded ? 'Hide contributors' : 'See contributors'}
	</button>

	{#if expanded}
		<div id={contentId} class="flex flex-col gap-2 overflow-hidden" transition:slide={{ duration: 180 }}>
			<span class="font-bold text-surface-800">Contributors:</span>

			{#if uniqueContributors.length === 0}
				<p class="text-sm text-surface-500 break-words">No contributors in this circuit yet.</p>
			{:else}
				<div class="flex flex-wrap gap-2">
					{#each uniqueContributors as contributor}
						<div class="flex items-center gap-2 rounded-md border border-surface-200 px-2 py-1 max-w-full">
							{#if contributor.profilePicData}
								<Avatar src={contributor.profilePicData} width="w-6" />
							{:else}
								<Avatar initials={getInitials(contributor.username)} width="w-6" />
							{/if}
							<span class="text-sm text-surface-700 break-words">{contributor.username}</span>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>
