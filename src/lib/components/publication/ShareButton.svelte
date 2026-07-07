<script lang="ts">
	import { popup, getToastStore } from '@skeletonlabs/skeleton';
	import type { PopupSettings } from '@skeletonlabs/skeleton';
	import { page } from '$app/state';
	import Icon from '@iconify/svelte';

	export let path: string;
	export let title: string = '';
	export let description: string = '';
	export let learningObjectives: string[] = [];
	export let style: string = 'btn p-0 m-0 self-center text-surface-700';

	const toastStore = getToastStore();

	const target = `share-${path.replace(/[^a-zA-Z0-9]/g, '-')}`;
	const sharePopup: PopupSettings = {
		event: 'click',
		target,
		placement: 'bottom-end',
	};

	$: url = `${page.url.origin}${path}`;

	// Build a friendlier share message than just "title + link": a short intro,
	// the description and the learning objectives (bulleted) when they exist.
	$: shareText = (() => {
		const parts = [`I wanted to share "${title}" with you on CAIT.`];
		if (description.trim()) parts.push(description.trim());
		const objectives = learningObjectives.filter((lo) => lo.trim());
		if (objectives.length)
			parts.push(`What you'll learn:\n${objectives.map((lo) => `• ${lo}`).join('\n')}`);
		parts.push(url);
		return parts.join('\n\n');
	})();

	$: linkedInHref = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(shareText)}`;

	// mailto: links delegate to whatever mail client the OS has registered, and
	// they break when the URL gets too long, so cap the body but always keep the
	// link at the end. Users without a working mail handler can fall back to
	// "Copy message" below.
	const MAIL_BODY_LIMIT = 1500;
	$: mailBody = (() => {
		if (shareText.length <= MAIL_BODY_LIMIT) return shareText;
		const withoutUrl = shareText.slice(0, shareText.lastIndexOf(url)).trimEnd();
		return `${withoutUrl.slice(0, MAIL_BODY_LIMIT).trimEnd()}…\n\n${url}`;
	})();
	$: mailHref =
		`mailto:?subject=${encodeURIComponent(`Check out "${title}" on CAIT`)}` +
		`&body=${encodeURIComponent(mailBody)}`;

	async function copyToClipboard(text: string, label: string) {
		try {
			await navigator.clipboard.writeText(text);
			toastStore.trigger({ message: `${label} copied to clipboard`, background: 'variant-filled-success' });
		} catch {
			toastStore.trigger({ message: `Could not copy ${label.toLowerCase()}`, background: 'variant-filled-error' });
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
				<button type="button" class="w-full flex items-center gap-2 px-3 py-2" on:click={() => copyToClipboard(url, 'Link')}>
					<Icon icon="mdi:link-variant" /> Copy link
				</button>
			</li>
			<li>
				<button type="button" class="w-full flex items-center gap-2 px-3 py-2" on:click={() => copyToClipboard(shareText, 'Message')}>
					<Icon icon="mdi:content-copy" /> Copy message
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
