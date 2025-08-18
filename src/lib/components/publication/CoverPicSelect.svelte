<script lang="ts">
	import { FileButton } from '@skeletonlabs/skeleton';
	import { saveCover } from '$lib/util/indexDB';

	export let coverPic: File | undefined = undefined;
	export let toastStore: any;

	function chooseCover(e: Event) {
		const eventFiles = (e.target as HTMLInputElement).files;
		if (eventFiles && eventFiles[0]) {
			const file = eventFiles[0];

			if ((file.size / (1024*1024)) > 2) {
				return;
			}

			if (file.type === 'image/jpeg' || file.type === 'image/png') {
				coverPic = file;
				// Persist coverPic to IndexedDB
				saveCover(file);
			} else {
				toastStore.trigger({
					message: 'Invalid file type, please upload a .jpg or .png file',
					background: 'bg-warning-200'
				});
			}
		}
	}
</script>

<div>
	<div class="flex flex-col gap-2 h-full bg-surface-200
										border-2 border-dashed border-surface-700">
		<div>
			{#if coverPic}
				<img src={URL.createObjectURL(coverPic)}
					 alt="coverPicture"
					 class="max-h-96 w-full object-contain h-full">
			{/if}
		</div>
	</div>

	<div>
		{#if coverPic}
			<button on:click={() => coverPic = undefined} type="button"
					class="rounded-lg py-2 px-4 bg-surface-900 text-surface-50 hover:bg-opacity-85">
				Remove Cover Picture
			</button>
		{:else}
			<FileButton button="rounded-lg py-2 px-4 bg-surface-900 text-surface-50 hover:bg-opacity-85"
						on:change={chooseCover} name="coverPhoto">
				Upload Cover Picture
			</FileButton>
		{/if}
	</div>
</div>