<script lang="ts">
	import Icon from '@iconify/svelte';
	import { cookieConsent } from '$lib/stores/cookieConsent';
</script>

{#if $cookieConsent === null}
	<div
		class="fixed inset-x-0 bottom-0 z-50 p-4"
		role="dialog"
		aria-live="polite"
		aria-label="Cookie consent"
	>
		<div
			class="mx-auto flex max-w-4xl flex-col gap-4 rounded-lg bg-surface-50 p-5 shadow-lg
			       dark:bg-surface-800 dark:text-surface-100
			       md:flex-row md:items-center md:justify-between"
		>
			<div class="flex items-start gap-3">
				<Icon icon="mdi:cookie-outline" class="mt-0.5 shrink-0 text-2xl text-primary-500" />
				<p class="text-sm text-surface-700 dark:text-surface-200">
					We use cookies to show embedded content such as YouTube videos. These are only
					loaded once you accept.
				</p>
			</div>
			<div class="flex shrink-0 gap-3">
				<button
					class="btn rounded-lg border border-surface-400 px-4 py-2 text-sm font-bold
					       text-surface-700 dark:text-surface-100"
					on:click={() => cookieConsent.set('declined')}
				>
					Decline
				</button>
				<button
					class="btn rounded-lg bg-primary-700 px-4 py-2 text-sm font-bold text-surface-100"
					on:click={() => cookieConsent.set('accepted')}
				>
					Accept
				</button>
			</div>
		</div>
	</div>
{/if}
