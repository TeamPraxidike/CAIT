<script lang="ts">
	import { FileButton, getToastStore } from '@skeletonlabs/skeleton';
	import { saveCover } from '$lib/util/indexDB';

	export let coverPic: File | undefined = undefined;
	export let toastStore: any = null;

	export let width: string = "w-full";

	if (toastStore == null) {
		toastStore = getToastStore();
	}

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
	<div class="flex flex-col gap-2 min-h-56 bg-surface-200
										border-2 border-dashed border-surface-700">
		<div>
			{#if coverPic}
				<img src={URL.createObjectURL(coverPic)}
					 alt="coverPicture"
					 class="max-h-96 min-h-56 w-full h-auto object-contain block">
			{/if}
		</div>
	</div>

	<div>
		{#if coverPic}
			<button on:click={() => coverPic = undefined} type="button"
					class="mt-2 rounded-lg py-2 px-4 bg-surface-900 text-surface-50 dark:bg-surface-100 dark:text-surface-800 hover:bg-opacity-85">
				Remove Cover Picture
			</button>
		{:else}
			<FileButton button="mt-2 rounded-lg py-2 px-4 bg-primary-600 text-white hover:bg-primary-500"
						on:change={chooseCover} name="coverPhoto">
				Upload Cover Picture
			</FileButton>
		{/if}
	</div>
</div>