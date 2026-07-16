<script lang="ts">
	import Icon from '@iconify/svelte';
	import { formatTimeEstimate, getLicenseUrl } from '$lib/util/publicationMetadata';

	export let timeEstimate: number | null = null;
	export let copyright = '';
	export let selfMade = false;

	let formattedTime: string | null;
	let licenseUrl: string | null;

	$: formattedTime = formatTimeEstimate(timeEstimate);
	$: licenseUrl = getLicenseUrl(copyright);
</script>

<section
	aria-labelledby="material-details-heading"
	class="mt-4 rounded-lg border border-surface-300 bg-surface-50 p-4 dark:border-surface-600 dark:bg-surface-800">
	<h2 id="material-details-heading" class="mb-3 text-lg font-semibold text-surface-900 dark:text-surface-50">
		Material details
	</h2>

	<dl class="grid grid-cols-1 gap-4 sm:grid-cols-3">
		<div>
			<dt class="font-medium text-surface-700 dark:text-surface-300">Estimated completion time</dt>
			<dd class="mt-1 text-surface-900 dark:text-surface-50">
				{formattedTime ?? 'Not specified'}
			</dd>
		</div>

		<div>
			<dt class="font-medium text-surface-700 dark:text-surface-300">License</dt>
			<dd class="mt-1 text-surface-900 dark:text-surface-50">
				{#if licenseUrl}
					<a
						href={licenseUrl}
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center gap-1 font-medium text-primary-700 underline decoration-1 underline-offset-2 hover:text-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 dark:text-primary-300"
						aria-label={`${copyright} license details (opens in a new tab)`}>
						{copyright}
						<Icon icon="material-symbols:open-in-new" class="text-base" aria-hidden="true" />
					</a>
				{:else}
					{copyright || 'Not specified'}
				{/if}
			</dd>
		</div>

		<div>
			<dt class="font-medium text-surface-700 dark:text-surface-300">Created by uploader</dt>
			<dd class="mt-1 text-surface-900 dark:text-surface-50">{selfMade ? 'Yes' : 'No'}</dd>
		</div>
	</dl>
</section>
