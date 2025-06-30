<script lang="ts">
	import { FileDropzone } from '@skeletonlabs/skeleton';
	import { FileTable } from '$lib';
	import { concatFileList } from '$lib/util/file';
	import { saveFiles } from '$lib/util/indexDB';

	export let fileURLs: string[] = [];
	export let files: FileList = new FileList();

	let fileURL = '';

	function appendToFileList(e: Event) {
		const eventFiles = (e.target as HTMLInputElement).files;
		if (eventFiles && eventFiles.length > 0) {
			// Merge new files into the existing FileList
			files = concatFileList(files, eventFiles);

			// Convert final FileList to an array and store in IndexedDB **/
			saveFiles(Array.from(files));
		}
	}

	function appendFileURLtoList() {
		if (fileURL !== '' && fileURLs.indexOf(fileURL) == -1)
			fileURLs = [...fileURLs, fileURL]
		fileURL = ''
		console.log(fileURLs);
	}
</script>


<div class="grid grid-cols-2 gap-4">
	<div class="flex flex-col h-80">
		<div class="flex-1">
			<FileDropzone
				on:change={appendToFileList}
				multiple
				name="file"
				class="w-full h-full border-2 border-dashed rounded-xl p-4"
			/>
		</div>

		<!-- URL Input + Button Row -->
		<div class="mt-4 flex gap-4">
			<div class="flex flex-col flex-1">
				<label for="urlInput" class="mb-1 text-sm font-medium text-gray-700">Or enter a URL</label>
				<input
					type="url"
					id="urlInput"
					name="url"
					placeholder="https://example.com"
					class="w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
					bind:value = {fileURL}
				/>
			</div>

			<div class="self-end">
				<button
					on:click={appendFileURLtoList}
					type="button"
					class="px-6 py-3 text-white bg-primary-600 hover:bg-primary-500 rounded-xl shadow-md transition duration-200 text-lg"
				>
					Upload
				</button>
			</div>
		</div>
	</div>
	<FileTable operation="edit" bind:files={files} bind:fileURLs={fileURLs}/>
</div>