<script lang="ts">
	import Icon from '@iconify/svelte';
	import { cookieConsent } from '$lib/stores/cookieConsent';

	export let videoId: string;
	export let title = 'Embedded YouTube video';
</script>

<div class="relative aspect-video w-full overflow-hidden rounded-lg bg-surface-900">
	{#if $cookieConsent === 'accepted'}
		<!-- youtube-nocookie.com defers YouTube's tracking cookies until playback -->
		<iframe
			class="absolute inset-0 h-full w-full"
			src="https://www.youtube-nocookie.com/embed/{videoId}"
			{title}
			frameborder="0"
			allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
			referrerpolicy="strict-origin-when-cross-origin"
			allowfullscreen
		></iframe>
	{:else}
		<div class="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
			<Icon icon="mdi:youtube" class="text-4xl text-surface-300" />
			<p class="text-sm text-surface-200">
				This video is hosted on YouTube, which sets cookies. Accept cookies to watch it here.
			</p>
			<button
				class="btn rounded-lg bg-primary-700 px-4 py-2 text-sm font-bold text-surface-100"
				on:click={() => cookieConsent.set('accepted')}
			>
				Accept &amp; play
			</button>
		</div>
	{/if}
</div>
