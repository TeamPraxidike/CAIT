<script lang="ts">
	import { getToastStore } from '@skeletonlabs/skeleton';
	import { page } from '$app/state';
	import Icon from '@iconify/svelte';

	export let publicationId: number;
	export let path: string;
	export let style: string = 'btn p-0 m-0 self-center text-surface-700';

	const toastStore = getToastStore();
	let creating = false;

	async function shareDraft() {
		if (creating) return;
		creating = true;

		try {
			const response = await fetch(`/api/publication/${publicationId}/share`, {
				method: 'POST',
			});
			if (!response.ok) throw new Error('Could not create draft link');

			const { token } = await response.json();
			const url = new URL(path, page.url.origin);
			url.searchParams.set('draftToken', token);
			await navigator.clipboard.writeText(url.toString());
			toastStore.trigger({
				message: 'Draft link copied. It expires in 14 days.',
				background: 'variant-filled-success',
			});
		} catch {
			toastStore.trigger({
				message: 'Could not create the draft link',
				background: 'variant-filled-error',
			});
		} finally {
			creating = false;
		}
	}
</script>

<button
	type="button"
	class={style}
	on:click={shareDraft}
	disabled={creating}
	aria-label={creating ? 'Creating draft share link' : 'Share draft link'}
	title="Share draft link (expires in 14 days)"
>
	<Icon
		icon={creating ? 'mdi:loading' : 'mdi:share-variant-outline'}
		width="24"
		class={creating ? 'animate-spin' : ''}
	/>
</button>
