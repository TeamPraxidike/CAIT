<script lang="ts">
	import { FileDropzone } from '@skeletonlabs/skeleton';
	import { FileTable } from '$lib';
	import { concatFileList } from '$lib/util/file';
	import {
		deleteFileTUSMetadata,
		type FileTUSMetadata,
		getFileTUSMetadata,
		saveFiles,
		saveFileTUSMetadata
	} from '$lib/util/indexDB';
	import { onMount } from 'svelte';

	export let fileURLs: string[] = [];
	export let files: FileList = [] as unknown as FileList;
	export let fileTUSMetadata: { [key: string] : FileTUSMetadata } = {}
	export let supabaseClient: any = null;
	export let fileTUSProgress: { [key: string]: any } = {}
	export let fileTUSUploadObjects: { [key: string]: any } = {}

	// these are purely for the editing page
	// TODO: either find a different solution or redo UploadFilesForm + FileTable
	export let integrateWithIndexDB: boolean = true;
	export let fetchedFiles: FetchedFileArray | [] = [];

	const supabaseURL = import.meta.env.PUBLIC_SUPABASE_URL ?? 'http://localhost:8000';
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
					cacheControl: 3600,
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
					console.log('Download %s from %s', (upload.file as File).name, upload.url)

					// save locally
					fileTUSMetadata[file.name]['isDone'] = true;
					fileTUSMetadata = {...fileTUSMetadata};

					if (integrateWithIndexDB){
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
		const eventFiles = (e.target as HTMLInputElement).files;
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
			if (integrateWithIndexDB){
				await saveFiles(Array.from(files));
			}

			// for each of the files, generate a name
			// add to IndexedDB and start TUS uploading
			for (const currentFile of files) {

				// if we already have the metadata then the file is not new
				if (!(await isFileTUSMetaAlreadyProcessed(currentFile))) {

					console.log(`${currentFile.name} not processed yet`);

					// source: https://github.com/tronprotocol/tronweb/issues/531
					const pathFileNameGenerated =
						`${crypto.randomUUID()}` + `.${(currentFile.name + '').split('.').pop()}`;

					const currentTUSMetadata: FileTUSMetadata = {
						originalName: currentFile.name,
						generatedName: pathFileNameGenerated,
						isDone: false
					}

					try{
						if (integrateWithIndexDB){
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
						if (integrateWithIndexDB){
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
	<FileTable operation="edit" fileFormat="upload"
			   integrateWithIndexDB={integrateWithIndexDB} fetchedFiles={fetchedFiles}
			   bind:files={files} bind:fileURLs={fileURLs}
			   bind:fileTUSMetadata={fileTUSMetadata} bind:fileTUSProgress={fileTUSProgress}
			   bind:fileTUSUploadObjects={fileTUSUploadObjects} bind:supabaseClient={supabaseClient}/>
</div>