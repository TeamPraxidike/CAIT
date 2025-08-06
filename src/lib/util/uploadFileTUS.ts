import * as tus from 'tus-js-client'
import { type FileTUSMetadata, saveFileTUSMetadata } from '$lib/util/indexDB';

// source: https://supabase.com/docs/guides/storage/uploads/resumable-uploads?queryGroups=language&language=js

export async function uploadFileTUS(bucketName: string, fileName: string,
									file: File, contentType: string,
									fileTUSMetadata: { [key: string] : FileTUSMetadata },
									fileTUSProgress: { [key: string]: any },
									fileTUSUploadObjects: { [key: string]: any },
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

				// update indexedDB
				await saveFileTUSMetadata(fileTUSMetadata[file.name]);

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