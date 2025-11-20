<script lang="ts">
	import Icon from '@iconify/svelte';
	import {FileDropzone, ProgressRadial} from '@skeletonlabs/skeleton';
	import { FileTable } from '$lib';
	import { concatFileList } from '$lib/util/file';
	import {
		deleteFileTUSMetadata,
		type FileTUSMetadata,
		saveFiles,
		saveFileTUSMetadata
	} from '$lib/util/indexDB';

	export let fileURLs: string[] = [];
	export let files: FileList = [] as unknown as FileList;
	export let fileTUSMetadata: { [key: string] : FileTUSMetadata } = {}
	export let supabaseClient: any = null;
	export let fileTUSProgress: { [key: string]: any } = {}
	export let fileTUSUploadObjects: { [key: string]: any } = {}

	// these are purely for the editing page
	// TODO: either find a different solution or redo UploadFilesForm + FileTable
	export let isEditContext: boolean = false;
	export let fetchedFiles: FetchedFileArray | [] = [];

	export let supabaseURL: string = 'http://localhost:8000';
	const bucketName = "uploadedFiles"

	let fileURL = '';

	import * as tus from 'tus-js-client'
	import type { FetchedFileArray } from '$lib/database';

	// source: https://supabase.com/docs/guides/storage/uploads/resumable-uploads?queryGroups=language&language=js

	export async function uploadFileTUS(bucketName: string, fileName: string,
										file: File, contentType: string,
										supabaseClient: any, supabaseURL: string) {

		const { data: { session } } = await supabaseClient.auth.getSession()

		return new Promise((resolve, reject) => {
			const upload = new tus.Upload(file, {
				// Supabase TUS endpoint (with direct storage hostname)
				endpoint: `${supabaseURL}/storage/v1/upload/resumable`,
				// endpoint: `${supabaseURL}/upload/resumable`,
				retryDelays: [0, 3000, 5000, 10000, 20000],
				headers: {
					//TODO: authorizationToken could expire, leading to rejection every time
					authorization: `Bearer ${session.access_token}`,
					'x-upsert': 'true', // optionally set upsert to true to overwrite existing files
				},
				uploadDataDuringCreation: true,
				removeFingerprintOnSuccess: true, // Important if you want to allow re-uploading the same file https://github.com/tus/tus-js-client/blob/main/docs/api.md#removefingerprintonsuccess
				metadata: {
					bucketName: bucketName,
					objectName: fileName,
					contentType: contentType,
					cacheControl: "3600",
				},
				chunkSize: 6 * 1024 * 1024, // NOTE: it must be set to 6MB (for now) do not change it
				onError: function (error) {
					// TODO
					// console.log('Failed because: ' + error)
					reject(error)
				},
				onProgress: function (bytesUploaded, bytesTotal) {
					const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2)
					// console.log(bytesUploaded, bytesTotal, percentage + '%')

					// use original name for clarity
					fileTUSProgress[file.name] = percentage;
					fileTUSProgress = {...fileTUSProgress};
				},
				onSuccess: async function() {
					// save locally
					fileTUSMetadata[file.name]['isDone'] = true;
					fileTUSMetadata = {...fileTUSMetadata};

					if (!isEditContext){
						// update indexedDB
						await saveFileTUSMetadata(fileTUSMetadata[file.name]);
					}

					resolve()
				},
			})

			fileTUSUploadObjects[file.name] = upload;
			fileTUSUploadObjects = {...fileTUSUploadObjects};

			// Check if there are any previous uploads to continue.
			return upload.findPreviousUploads().then(function (previousUploads) {
				// Found previous uploads so we select the first one.
				if (previousUploads.length) {
					upload.resumeFromPreviousUpload(previousUploads[0])
				}
				// Start the upload
				upload.start()
			})
		})
	}

	async function isFileTUSMetaAlreadyProcessed(file: File) {
		return (file.name in fileTUSMetadata);
	}

	async function appendToFileList(e: Event) {
		const input = e.target as HTMLInputElement;
		const eventFiles = input.files;
		if (eventFiles && eventFiles.length > 0) {
			// retain files that are under the per-file size limit
			let filesToUse = []
			for (const eventFile of eventFiles){
				if ((eventFile.size / (1024*1024)) <= 100) {
					filesToUse.push(eventFile);
				}
			}

			// Merge new files into the existing FileList
			files = concatFileList(files, filesToUse);

			// convert final FileList to an array and store in IndexedDB
			if (!isEditContext){
				await saveFiles(Array.from(files));
			}

			// for each of the files, generate a name
			// add to IndexedDB and start TUS uploading
			for (const currentFile of files) {

				// if we already have the metadata then the file is not new
				if (!(await isFileTUSMetaAlreadyProcessed(currentFile))) {

					// source: https://github.com/tronprotocol/tronweb/issues/531
					const pathFileNameGenerated =
						`${crypto.randomUUID()}` + `.${(currentFile.name + '').split('.').pop()}`;

					const currentTUSMetadata: FileTUSMetadata = {
						originalName: currentFile.name,
						generatedName: pathFileNameGenerated,
						isDone: false
					}

					try{
						if (!isEditContext){
							// save metadata to indexedDB
							await saveFileTUSMetadata(currentTUSMetadata)
						}

						// update local variable
						fileTUSMetadata[currentTUSMetadata.originalName] = currentTUSMetadata;
						fileTUSMetadata = {...fileTUSMetadata};

						// start actual upload
						uploadFileTUS(bucketName, pathFileNameGenerated, currentFile, currentFile.type,
							supabaseClient, supabaseURL);
					}
					catch (e) {
						if (!isEditContext){
							await deleteFileTUSMetadata(pathFileNameGenerated);
						}
						if (fileTUSMetadata[currentTUSMetadata.originalName]){
							delete fileTUSMetadata[currentTUSMetadata.originalName];
							fileTUSMetadata = {...fileTUSMetadata};
						}
					}
				}
			}
		}

		// allows reselecting the same file later
		// think of it as deleting cache
		input.value = '';
	}

	function appendFileURLtoList() {
		if (fileURL !== '' && fileURLs.indexOf(fileURL) == -1)
			fileURLs = [...fileURLs, fileURL]
		fileURL = ''
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
			>
				<svelte:fragment slot="meta">Max. size per file: 100MB</svelte:fragment>
			</FileDropzone>
		</div>

		<!-- URL Input + Button Row -->
		<div class="mt-4">
			<label for="urlInput" class="mb-1 block font-medium">Or enter a URL</label>
			<div class="flex items-center gap-4">
				<input
					type="url"
					id="urlInput"
					name="url"
					placeholder="https://example.com"
					class="rounded-lg dark:bg-surface-800 bg-surface-50 w-full text-surface-700 dark:text-surface-400 focus:border-primary-500 focus:ring-0"
					bind:value = {fileURL}
				/>
				<button
					on:click={appendFileURLtoList}
					type="button"
					class="text-center text-surface-50 bg-primary-600 hover:bg-primary-500 rounded-full p-0.5 flex items-center justify-center w-8 h-8 min-w-8 min-h-8">
	                    <Icon icon="mdi:arrow-right-thick" width="20" height="20"  class="text-white" />
	            </button>
			</div>
		</div>
	</div>
	<FileTable operation="edit" fileFormat="upload"
		   isEditContext={isEditContext} fetchedFiles={fetchedFiles}
		   bind:files={files} bind:fileURLs={fileURLs}
		   bind:fileTUSMetadata={fileTUSMetadata} bind:fileTUSProgress={fileTUSProgress}
		   bind:fileTUSUploadObjects={fileTUSUploadObjects} bind:supabaseClient={supabaseClient}/>
</div>