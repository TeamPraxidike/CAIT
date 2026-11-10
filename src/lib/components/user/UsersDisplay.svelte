<script lang="ts">
	import { type UserSanitizedWithProfilePicData } from '$lib';
	import { Avatar } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';

	export let users: UserSanitizedWithProfilePicData[] = [];

	const getInitials = (name: string): string => {
		return name
			.trim()
			.split(/\s+/)
			.map((part) => part[0]?.toUpperCase() ?? '')
			.join('')
			.slice(0, 2);
	};

	// Group users into pairs for mobile scrolling
	const groupedUsers: UserSanitizedWithProfilePicData[][] = [];
	for (let i = 0; i < users.length; i += 2) {
		groupedUsers.push(users.slice(i, i + 2));
	}

	let scrollContainer: HTMLDivElement;
	let currentIndex = 0;

	onMount(() => {
		if (!scrollContainer || groupedUsers.length === 0) return;

		const autoScroll = () => {
			currentIndex = (currentIndex + 1) % groupedUsers.length;
			const scrollAmount = (scrollContainer.scrollWidth / groupedUsers.length) * currentIndex;
			scrollContainer.scrollTo({
				left: scrollAmount,
				behavior: 'smooth'
			});
		};

		const interval = setInterval(autoScroll, 5000); // Scroll every 5 seconds

		return () => clearInterval(interval);
	});
</script>

<!-- Use full width/height and tighter vertical spacing so the parent container controls layout -->
<div class="w-full h-full flex flex-col gap-4 my-0">
	<span class="text-lg md:text-3xl font-extrabold tracking-tight text-surface-900 dark:text-surface-100 mb-2">Biggest Contributors to CAIT</span>

	{#if users.length === 0}
		<p class="text-sm text-surface-600 dark:text-surface-300">No contributors yet.</p>
	{/if}

	<!-- horizontal scroll with paired columns on mobile, 2-column grid on md+ -->
	<div bind:this={scrollContainer} class="w-full flex md:grid md:grid-cols-2 gap-4 overflow-x-auto pb-2 md:pb-0 snap-x snap-mandatory scrollbar-hide">
		{#each groupedUsers as pair}
			<div class="w-full md:w-auto flex-shrink-0 md:flex-shrink flex flex-col gap-4 snap-center">
				{#each pair as user}
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
		{/each}
	</div>
</div>

<style>
	:global(.scrollbar-hide) {
		-ms-overflow-style: none; /* IE and Edge */
		scrollbar-width: none; /* Firefox */
	}

	:global(.scrollbar-hide::-webkit-scrollbar) {
		display: none; /* Chrome, Safari and Opera */
	}
</style>
