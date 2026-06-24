<script lang="ts">
	import { popup, getToastStore } from '@skeletonlabs/skeleton';
	import type { PopupSettings } from '@skeletonlabs/skeleton';
	import { page } from '$app/state';
	import Icon from '@iconify/svelte';

	export let path: string;
	export let title: string = '';
	export let style: string = 'btn p-0 m-0 self-center text-surface-700';

	const toastStore = getToastStore();

	const target = `share-${path.replace(/[^a-zA-Z0-9]/g, '-')}`;
	const sharePopup: PopupSettings = {
		event: 'click',
		target,
		placement: 'bottom-end',
	};

	$: url = `${page.url.origin}${path}`;
	$: linkedInHref = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(`${title}\n\n${url}`)}`;
	$: mailHref =
		`mailto:?subject=${encodeURIComponent(`Check out "${title}" on CAIT`)}` +
		`&body=${encodeURIComponent(`I thought you might find this useful:\n\n${url}\n`)}`;

	async function copyLink() {
		try {
			await navigator.clipboard.writeText(url);
			toastStore.trigger({ message: 'Link copied to clipboard', background: 'variant-filled-success' });
		} catch {
			toastStore.trigger({ message: 'Could not copy link', background: 'variant-filled-error' });
		}
	}
</script>

<button type="button" class={style} use:popup={sharePopup} aria-label="Share">
	<Icon icon="mdi:share-variant-outline" width="24" />
</button>

<div class="card p-1 shadow-xl w-48 text-sm" data-popup={target} style="z-index:9999">
	<nav class="list-nav">
		<ul>
			<li>
				<button type="button" class="w-full flex items-center gap-2 px-3 py-2" on:click={copyLink}>
					<Icon icon="mdi:link-variant" /> Copy link
				</button>
			</li>
			<li>
				<a class="w-full flex items-center gap-2 px-3 py-2" href={linkedInHref} target="_blank" rel="noopener noreferrer">
					<Icon icon="mdi:linkedin" /> Share on LinkedIn
				</a>
			</li>
			<li>
				<a class="w-full flex items-center gap-2 px-3 py-2" href={mailHref}>
					<Icon icon="mdi:email-outline" /> Email
				</a>
			</li>
		</ul>
	</nav>
</div>
