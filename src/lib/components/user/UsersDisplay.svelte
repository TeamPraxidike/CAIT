<script lang="ts">
	import { type UserSanitizedWithProfilePicData } from '$lib';
	import { Avatar } from '@skeletonlabs/skeleton';
	export let users: UserSanitizedWithProfilePicData[] = [];

	const getInitials = (name: string): string => {
		return name
			.trim()
			.split(/\s+/)
			.map((part) => part[0]?.toUpperCase() ?? '')
			.join('')
			.slice(0, 2);
	};
</script>

<!-- Use full width/height and tighter vertical spacing so the parent container controls layout -->
<div class="w-full h-full flex flex-col gap-4 my-0">
	<span class="text-lg md:text-3xl font-extrabold tracking-tight text-surface-900 dark:text-surface-100 mb-2">Biggest Contributors to CAIT</span>

	{#if users.length === 0}
		<p class="text-sm text-surface-600 dark:text-surface-300">No contributors yet.</p>
	{/if}

	<!-- responsive grid: 1 column on small screens, 2 columns on md+ to take more horizontal space -->
	<div class="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
		{#each users as user}
			<div class="w-full flex items-center gap-4 rounded-lg bg-surface-50 dark:bg-surface-800 p-4 shadow-md border border-surface-200 min-h-[72px]">
				{#if user.profilePicData}
					<Avatar src={user.profilePicData} class="w-14 h-14 md:w-20 md:h-20 rounded-full object-cover" />
				{:else}
					<Avatar initials={getInitials(user.username)} class="w-14 h-14 md:w-20 md:h-20 rounded-full" />
				{/if}
				<div class="flex flex-col flex-1 min-w-0">
					<span class="text-base md:text-xl font-semibold text-surface-900 dark:text-surface-100 truncate">{user.firstName} {user.lastName}</span>
					<div class="flex items-center gap-3 mt-2">
						<span class="text-sm text-surface-700 dark:text-surface-300">Reputation</span>
						<span class="inline-flex items-center justify-center px-3 py-1 rounded-full bg-primary-600 text-white text-sm md:text-base font-semibold">{user.reputation}</span>
					</div>
				</div>
			</div>
		{/each}
	</div>
</div>
