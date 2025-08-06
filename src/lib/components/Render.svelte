<script lang="ts">
	import { CodeBlock, getModalStore } from '@skeletonlabs/skeleton';
	import Icon from '@iconify/svelte';
	import { Download, formatFileSize } from '$lib';
	import type { FetchedFileItem } from '$lib/database';
	import DocumentViewer from '$lib/components/DocumentViewer.svelte';

	//export let file: File;
	export let file: FetchedFileItem | File;
	export let fileFormat: 'upload' | 'fetch' = 'upload'

	const SUPPORTED_VIEWER_FILES = [
		// PDF
		'pdf', 'pdf/a',

		// Images
		// 'png',
		// 'jpeg', 'jpg',
		// 'tiff', 'tif',
		//
		// // Office documents
		// 'docx', 'doc', 'dotx', 'docm',
		// 'xlsx', 'xls', 'xlsm',
		// 'pptx', 'ppt', 'pptm',
	]

	function getExtension(file: File | FetchedFileItem): string {
		// TODO: handle this edge case, shouldn't be possible but still
		if (file.name === undefined) {
			// error = new Error("Expected some value for the extension, got undefined");
			return "";
		}
		const parts = file.name.split('.');
		// if there are at least two members, take the last one, lowercase it
		return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
	}

	function isSupportedForPreview(extension: string) {
		console.log(extension);
		console.log(SUPPORTED_VIEWER_FILES.includes(extension));
		return SUPPORTED_VIEWER_FILES.includes(extension);
	}

	// if this returns true, the file variable will be treated as an instance
	// of the File class, otherwise we use our own FetchedFileItem
	function isBrowserFile(
		f: FetchedFileItem | File
	): f is File {
		return fileFormat === 'upload'
	}

	const decoder = new TextDecoder('utf-8');

	function getLanguage(type: string) {
		if (type.startsWith('text') || type.startsWith('application')) {
			let lang = type.split('/')[1];

			lang = lang === 'vnd.trolltech.linguist' ? 'typescript' : lang;
			lang.startsWith('x-') ? lang = lang.split('-')[1] : lang;
			let supported = ['xml', 'css', 'javascript', 'typescript', 'python', 'rust', 'scala', 'plaintext'];

			return supported.includes(lang) ? lang : 'plaintext';
		}
		return 'plaintext';
	}

	const modalStore = getModalStore();

	function closeModal() {
		modalStore.close();
	}
</script>

<div class="bg-surface-100 p-8 rounded-lg flex flex-col">
	<h4 class="text-xl">{file.name}</h4>
	<p class="text-surface-500 dark:text-surface-300">{file.type}</p>
	<div class="w-[60vw] max-h-[80vh] border rounded-lg snap-y overflow-y-auto scroll-smooth snap-mandatory">
		<!--TODO: This works and it was easy to implement but it's not pretty - repeated code-->
		{#if isBrowserFile(file)}
			<!--TODO: Figure out a reasonable cutoff-->
			{#if file.size > 1024 * 1024 * 100}
				<div
					class="h-full w-full flex flex-col gap-2 justify-center items-center text-surface-500 dark:text-surface-300">
					<Icon icon="bi:exclamation-triangle" class="text-4xl text-surface-500 dark:text-surface-300" />
					<p>File too large to render</p>
				</div>
			{:else}
				{#await file.arrayBuffer()}
					<div>Loading...</div>
				{:then fileBuffer}
					{#if file.type.startsWith('video')}
						<video class="bg-black w-full max-h-[70vh]" controls>
							<track kind="captions" src="">
							<track kind="subtitles" src="">
							<source src={URL.createObjectURL(new Blob([fileBuffer], { type: file.type }))}
									type={file.type} />
						</video>
					{:else if file.type.startsWith('text')}
						<CodeBlock language={getLanguage(file.type)} code={decoder.decode(fileBuffer)} />
					{:else if isSupportedForPreview(getExtension(file))}
<!--						<DocumentViewer documentURL={URL.createObjectURL(new Blob([fileBuffer], { type: file.type }))} />-->
						<iframe title={file.name} src={URL.createObjectURL(new Blob([fileBuffer], { type: file.type }))}
								class="w-full h-[70vh]"></iframe>
					{:else}
						<div
							class="h-full w-full flex flex-col gap-2 justify-center items-center text-surface-500 dark:text-surface-300">
							<Icon icon="bi:file-earmark" class="text-4xl text-surface-500 dark:text-surface-300" />
							<p>Cannot preview file: {file.type}</p>
						</div>
					{/if}
				{:catch error}
					<div>Error loading the file: {error.message}</div>
				{/await}
			{/if}
		{:else}
			{#if file.type.startsWith('video')}
				<video class="bg-black w-full max-h-[70vh]" controls>
					<track kind="captions" src="">
					<track kind="subtitles" src="">
					<source src={file.data}
							type={file.type} />
				</video>
			{:else if file.type.startsWith('text')}
				<CodeBlock language={getLanguage(file.type)} code={file.data ?? ''} />
			{:else if isSupportedForPreview(getExtension(file))}
<!--				<DocumentViewer documentURL={file.data} />-->
				<iframe title={file.name} src={file.data}
						class="w-full h-[70vh]"></iframe>
			{:else}
				<div
					class="h-full w-full flex flex-col gap-2 justify-center items-center text-surface-500 dark:text-surface-300">
					<Icon icon="bi:file-earmark" class="text-4xl text-surface-500 dark:text-surface-300" />
					<p>Cannot preview file: {file.type}</p>
				</div>
			{/if}
			<!--{:catch error}-->
			<!--	<div>Error loading the file: {error.message}</div>-->
			<!--{/await}-->
			<!--{/if}-->
		{/if}
	</div>
	<div class="self-end flex items-center gap-2 mt-4">
		{#if isBrowserFile(file)}
			<span class="text-surface-600">Size: {formatFileSize(file.size)}</span>
		{/if}
		<button type="button" on:click={closeModal} class="btn rounded-lg variant-soft-surface">Close</button>
		<Download {file} className="btn rounded-lg bg-surface-600 text-surface-50">Download</Download>
	</div>
</div>
