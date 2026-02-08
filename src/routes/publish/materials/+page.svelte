<script lang="ts">
	import type { ActionData, PageServerData } from './$types';
	import type {  Difficulty, Tag as PrismaTag } from '@prisma/client';
	import { page } from '$app/state';
	import { onDestroy, onMount, tick } from 'svelte';
	import {type UserWithProfilePic} from '$lib/util/coursesLogic';

	import {
		type FormSnapshot,
		type FileTUSMetadata,
		getCover,
		getFiles,
		getMaterialSnapshot,
		saveMaterialSnapshot, getFileTUSMetadata, saveFileTUSMetadata,
		clearIfTimeExceeded
	} from '$lib/util/indexDB';
	import * as tus from 'tus-js-client';
	import type { ParamsImmutable, ParamsMutable, ParamsMutableMaterial } from '$lib/util/frontendTypes.ts';
	import PublishWorkflow from '$lib/components/publication/publish/PublishWorkflow.svelte';
	import { arrayToFileList } from '$lib/util/file.ts';

	export let form: ActionData;
	export let data: PageServerData;

	const supabaseURL: string = data.PUBLIC_SUPABASE_URL;
	let loggedUser = page.data.loggedUser;
	let isSubmitting: boolean = false;

	// tags
	let tags: string[] = [];
	$: tags = tags;
	let allTags: PrismaTag[] = data.tags;
	let newTags: string[] = [];

	let files: FileList = [] as unknown as FileList;
	let fileURLs: string[] = [] as string[];
	let maintainers: UserWithProfilePic[] = [];
	let courses = data.courses;
	$: courses = courses;

	let originalCourseIds: number[] = courses.map(c => c.id);

	let users: UserWithProfilePic[] = data.users;
	let searchableUsers = users.filter((u) => u.id !== loggedUser.id);
	// learning objectives
	let LOs: string[] = [];
	let PKs: string[] = [];

	// input data
	let title: string = '';
	let description: string = '';
	let course: number | null = null;
	let difficulty: Difficulty = 'easy';
	let estimate: number = 0;
	let copyright: string = '';
	let theoryApplicationRatio: number = 0.5;
	let selectedTypes: string[] = [];
	$: selectedType = selectedTypes.length > 0 ? selectedTypes[0] : 'Select type';


	// TODO: do I absolutely need these for reactivity?
	// also, this whole system could be redesigned with event emitters
	// rather than binding values
	let fileTUSMetadata: { [key: string] : FileTUSMetadata } = {};
	$: fileTUSMetadata = fileTUSMetadata;
	let fileTUSProgress: { [key: string]: any } = {};
	$: fileTUSProgress = fileTUSProgress
	let fileTUSUploadObjects: { [key: string]: any } = {};
	$: fileTUSUploadObjects = fileTUSUploadObjects

	// cover
	let coverPic: File | undefined = undefined;
	$: uid = page.data.session?.user.id;
	let showCourseProgressRadial = false;

	let paramsMutable: ParamsMutable;
	paramsMutable = {
		isSubmitting,
		title,
		loggedUser,
		searchableUsers,
		LOs,
		PKs,
		maintainers,
		tags,
		newTags,
		description
	}

	let paramsMutableMaterial: ParamsMutableMaterial = {
		fileTUSMetadata,
		fileTUSProgress,
		fileTUSUploadObjects,
		fileURLs,
		files,
		showCourseProgressRadial,
		selectedTypes,
		originalCourseIds,
		courses,
		course,
		coverPic,
		estimate,
		copyright,
	}


	let paramsImmutable: ParamsImmutable;
	$: paramsImmutable = {
		supabaseClient,
		supabaseURL,
		users,
		liked: [],
		saved: [],
		allCourses: data.allCourses,
		uid,
		form,
		allTags
	}


	// TODO: I can't describe how much I hate this, needs to be redone
	// let authorizationToken: string | undefined = '';
	// $: authorizationToken = page.data.session?.access_token;

	let supabaseClient: any = page.data.supabase;

	const bucketName = "uploadedFiles"

	let showAnimation = false;
	const handleBeforeUnload = (event: BeforeUnloadEvent) => {
		showAnimation = false;
	};

	let saveInterval: number | undefined = undefined;

	// source: https://supabase.com/docs/guides/storage/uploads/resumable-uploads?queryGroups=language&language=js

	export async function uploadFileTUS(bucketName: string, fileName: string,
										file: File, contentType: string,
										supabaseClient: any, supabaseURL: string) {

		const { data: { session } } = await supabaseClient.auth.getSession()

		return new Promise<void>((resolve, reject) => {
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


	onMount(() => {
		(async () => {

			// THIS IS THE SNAPSHOT CODE (using indexDB)
			let existing = await getMaterialSnapshot();

			if (existing && await clearIfTimeExceeded(existing.lastOpened)) {
				existing = undefined; // clear snapshot locally
			}

			// Only hydrate from snapshot if it is still valid
			if (existing) {
				// TODO: This ?? business is meh, redo
				title = existing.title;
				description = existing.description;
				tags = existing.tags;
				newTags = existing.newTags;
				LOs = existing.LOs;
				PKs = existing.PKs;
				selectedType = existing.selectedType ?? 'Select type';
				difficulty = existing.difficulty ?? 'easy';
				maintainers = existing.maintainers;
				searchableUsers = existing.searchableUsers;
				estimate = existing.estimate ?? 0;
				copyright = existing.copyright ?? 'No copyright';
				theoryApplicationRatio = existing.theoryApplicationRatio ?? 0.5;
				fileURLs = existing.fileURLs ?? [];
			} else {
				console.log('No valid snapshot found (either none existed or it was expired and cleared).');
			}

			const storedCover = await getCover();
			if (storedCover) {
				coverPic = storedCover; // single file
			}
			else {
				console.log('No cover snapshot');
			}

			// get multiple files (returns array<File>)
			const storedFiles = await getFiles();
			if (storedFiles.length > 0) {
				// Rebuild a FileList from that array
				files = arrayToFileList(storedFiles);
			}
			else {
				console.log('No files snapshot');
			}

			// get file TUS metadata
			for (const f of storedFiles) {
				const currentData = await getFileTUSMetadata(f.name);
				if (currentData && currentData.originalName){
					fileTUSMetadata[currentData.originalName] = currentData;
					fileTUSMetadata = {...fileTUSMetadata};
				}
			}

			for (const f of files){
				if (!(fileTUSMetadata[f.name]['isDone'])){
					uploadFileTUS(bucketName, fileTUSMetadata[f.name]['generatedName'], f, f.type,
					supabaseClient, supabaseURL)
				}
			}

			paramsMutable = {
				isSubmitting,
				fileTUSMetadata,
				fileTUSProgress,
				fileTUSUploadObjects,
				fileURLs,
				files,
				title,
				showCourseProgressRadial,
				selectedTypes,
				originalCourseIds,
				courses,
				course,
				coverPic,
				loggedUser,
				searchableUsers,
				estimate,
				copyright,
				LOs,
				PKs,
				maintainers,
				tags,
				newTags,
				description
			};

			// start a 2-sec interval that captures a snapshot
			saveInterval = window.setInterval(() => {
				const data: FormSnapshot = {
					title: paramsMutable.title,
					description: paramsMutable.description,
					tags: paramsMutable.tags,
					newTags: paramsMutable.newTags,
					LOs: paramsMutable.LOs,
					PKs: paramsMutable.PKs,
					selectedType: paramsMutableMaterial.selectedTypes,
					difficulty: paramsMutableMaterial.selectedTypes,
					maintainers: paramsMutable.maintainers,
					searchableUsers: paramsMutable.searchableUsers,
					estimate: paramsMutableMaterial.estimate,
					copyright: paramsMutableMaterial.copyright,
					fileURLs: paramsMutableMaterial.fileURLs,
					theoryApplicationRatio: theoryApplicationRatio,
					lastOpened: Date.now()
				};

				saveMaterialSnapshot(data);
			}, 2000);

			window.addEventListener('beforeunload', handleBeforeUnload);

			return () => {
				if (saveInterval) {
					window.clearInterval(saveInterval);
				}
				window.removeEventListener('beforeunload', handleBeforeUnload);
			};
		})();
	});

	onDestroy(() => {
		if (saveInterval) {
			window.clearInterval(saveInterval);
		}
		showAnimation = false;
	});

</script>

<PublishWorkflow bind:data={paramsMutable}
				 bind:dataMaterial={paramsMutableMaterial}
				 edit={false}
				 paramsImmutable={paramsImmutable}
				 bind:showAnimation={showAnimation}
				dataCircuit={null}/>
