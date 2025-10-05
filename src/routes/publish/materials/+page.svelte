<script lang="ts">
	import { fade } from 'svelte/transition';
	import {
		Meta,
	} from '$lib';
	import { getToastStore, ProgressRadial} from '@skeletonlabs/skeleton';
	import { enhance } from '$app/forms';
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
		clearAllData, clearIfTimeExceeded
	} from '$lib/util/indexDB';
	import { allUploadsDone, downloadFileFromSupabase } from '$lib/util/file';
	import { isMaterialDraft } from '$lib/util/validatePublication';
	import Banner from '$lib/components/publication/Banner.svelte';
	import { changeCourse } from '$lib/util/coursesLogic';
	import * as tus from 'tus-js-client'
	import PublishStepper from '$lib/components/publication/publish/PublishStepper.svelte';
	import PublishConfirmation from '$lib/components/publication/publish/PublishConfirmation.svelte';

	/**
	 * Convert an array of File objects into a real FileList.
	 */
	export function arrayToFileList(files: File[]): FileList {
		const dt = new DataTransfer();
		files.forEach(file => dt.items.add(file));
		return dt.files;
	}

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
	let bannerFieldsList: string[] = [];

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

	let previousCourse: number | null = null;
	$: if (course !== previousCourse) {
		const currentCourse = courses.find(c => c.id === course);
		maintainers = [];
		const prev_temp = previousCourse;
		previousCourse = course;
		const result = changeCourse(course, prev_temp, LOs, PKs, courses, maintainers);
		course = result.course;
		LOs = result.LOs;
		PKs = result.PKs;
		maintainers = result.maintainers;

		if (currentCourse) {
			if (currentCourse.copyright !== "") {
				copyright = currentCourse.copyright;
			}
			if (currentCourse?.coverPic?.data) {
				downloadFileFromSupabase(supabaseClient, currentCourse.coverPic).then(f => {
					coverPic = f || undefined;
				});
			}
		}
	}

	// cover
	let coverPic: File | undefined = undefined;



	$: uid = page.data.session?.user.id;


	// TODO: I can't describe how much I hate this, needs to be redone
	// let authorizationToken: string | undefined = '';
	// $: authorizationToken = page.data.session?.access_token;

	let supabaseClient: any = page.data.supabase;
	//$: supabaseClient = page.data.supabase;

	const bucketName = "uploadedFiles"

	const toastStore = getToastStore();
	let showAnimation = false;
	$: if (showAnimation) {
		// tick() waits until the DOM has been updated
		tick().then(() => {
			window.scrollTo({ top: 0, behavior: 'smooth' });
		});
	}

	// IMPORTANT - use contexts to separate form events
	// otherwise, for example, any Course related form events get mistaken for
	// events from the main form
	$: if (form?.status === 200 && form?.context === 'publication-form') {
		console.log('Form submission successful:');
		if (saveInterval) {
			window.clearInterval(saveInterval);
		}

		Promise.all([
			clearAllData()
		]).then(async () => {
			showAnimation = true;
		}).catch(error => {
			console.error('Error clearing data:', error);
		});
	} else if (form?.status === 400 && form?.context === 'publication-form') {
		console.log('Form submission failed with status 400:');
		if (!allUploadsDone(fileTUSMetadata, files)){
			toastStore.trigger({
				message: 'Some files are still being uploaded',
				background: 'bg-warning-200'
			});
		}
		else {
			toastStore.trigger({
				message: `Malformed information, please check your inputs: ${form?.message}`,
				background: 'bg-warning-200',
				classes: 'text-surface-900'
			});
		}

		isSubmitting = false;
	} else if (form?.status === 418) {
		console.log("error 418 ");
		isSubmitting = false;
		showAnimation = false;
	} else if (form?.status === 500 && form?.context === 'publication-form') {
		console.log('Form submission failed with status 500:');
		toastStore.trigger({
			message: 'An error occurred, please try again later or contact support',
			background: 'bg-error-200',
			classes: 'text-surface-900'
		});
		isSubmitting = false;
	} else if (form?.status == 200 && form?.context === 'course-form') {
		const updated = form.course;
		const idx = courses.findIndex(c => c.id === updated.id);

		showCourseProgressRadial = false;

		if (idx !== -1) {
			courses[idx] = updated;
			courses = [...courses];
		} else {
			originalCourseIds = [...originalCourseIds, updated.id];
			courses.push(updated);
			courses = courses;
		}
		form = { ...form, context: "undefined" };
	}

	const handleBeforeUnload = (event: BeforeUnloadEvent) => {
		showAnimation = false;
	};

	let saveInterval: number | undefined = undefined;
	let showCourseProgressRadial = false;

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

			// get multiple files (returns array<File>)
			const storedFiles = await getFiles();
			if (storedFiles.length > 0) {
				// Rebuild a FileList from that array
				files = arrayToFileList(storedFiles);
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

			// start a 2-sec interval that captures a snapshot
			saveInterval = window.setInterval(() => {
				const data: FormSnapshot = {
					title,
					description,
					tags,
					newTags,
					LOs,
					PKs,
					selectedType,
					difficulty,
					maintainers,
					searchableUsers,
					estimate,
					copyright,
					fileURLs,
					theoryApplicationRatio,
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

	let markedAsDraft = false;
	let draft = true;
	$: metadata = {
		title,
		description,
		learningObjectives: LOs,
		tags,
		materialType: selectedTypes,
		isDraft: false
	};
	$: numMaterials = fileURLs.length + files.length;
	$: draft = isMaterialDraft(metadata, numMaterials);

	// TODO: cool but it's not working as expected, I've removed one condition
	// The selected type of the material is autofilled to 'Other' if none is selected but is still displayed in the banner to
	// incentivize the user to fill it in. This is why here we have to check whether it is the only thing that is missing
	// because if it the publication should not be a draft
	$: showDraftMessage = (bannerFieldsList.length >= 1 || markedAsDraft);
</script>

<Meta title="Publish" description="CAIT" type="site" />

{#if !showAnimation}
	<div class="col-span-full" out:fade={{duration: 400}}>
		<Banner bind:fieldsList={bannerFieldsList} metadata={metadata} files={numMaterials} materialType={metadata.materialType}/>
	</div>

	<div class="form-container col-span-full px-5 pt-5 pb-5 shadow"
		 out:fade={{duration: 400}}>
		<form method="POST"
			  enctype="multipart/form-data"
			  action="?/publish"
			  use:enhance={({ formData }) => {
					// apparently files are automatically appended to the form using the
					// file key, so just remove it
					formData.delete('file')
					isSubmitting = true;
					let willSubmit = true;

					// check if all the file uploads (excluding cover picture) are done
					if (!(allUploadsDone(fileTUSMetadata, files))){
						// alert('Some files are still being uploaded');
						isSubmitting = false;
						return;
					}

					for (const f of files){
						let uploadFormat = {
							title: f.name,
							type: f.type,
							info: fileTUSMetadata[f.name]['generatedName']
						}
						formData.append('file', JSON.stringify(uploadFormat));
					}

					for (const url of fileURLs){
						let uploadFormat = {
							title: url,
							type: "URL",
							info: url
						}
						formData.append('fileURLs', JSON.stringify(uploadFormat));
					}

					formData.append('userId', uid?.toString() || '');
					formData.append('title', title);
					formData.append('description', description);
					formData.append('type', JSON.stringify(selectedTypes));
					formData.append('difficulty', difficulty);
					formData.append('estimate', JSON.stringify(estimate));
					formData.append('copyright', copyright);
					formData.append('tags', JSON.stringify(tags));
					formData.append('maintainers', JSON.stringify(maintainers.map(m => m.id)));
					formData.append('learningObjectives', JSON.stringify(LOs));
					formData.append('prerequisites', JSON.stringify(PKs));
					formData.append('coverPic', coverPic || '');
					formData.append('newTags', JSON.stringify(newTags));
					formData.append('theoryToApplication', JSON.stringify(theoryApplicationRatio))
					formData.append('isDraft', JSON.stringify(markedAsDraft || draft));
					formData.append('course', course ? course.toString() : 'null');
			  }}>
			<PublishStepper
				bind:isSubmitting={isSubmitting}
				supabaseURL={supabaseURL}
				bind:supabaseClient={supabaseClient}
				bind:fileTUSMetadata={fileTUSMetadata}
				bind:fileTUSProgress={fileTUSProgress}
				bind:fileTUSUploadObjects={fileTUSUploadObjects}
				bind:fileURLs={fileURLs}
				bind:files={files}
				bind:title={title}
				bind:showCourseProgressRadial={showCourseProgressRadial}
				bind:selectedTypes={selectedTypes}
				bind:originalCourseIds={originalCourseIds}
				bind:courses={courses}
				bind:course={course}
				bind:coverPic={coverPic}
				bind:loggedUser={loggedUser}
				bind:searchableUsers={searchableUsers}
				allCourses={data.allCourses}
				users={users}
				bind:estimate={estimate}
				bind:copyright={copyright}
				bind:LOs={LOs}
				bind:PKs={PKs}
				bind:maintainers={maintainers}
				allTags={allTags}
				bind:tags={tags}
				bind:newTags={newTags}
				bind:description={description}
				draft={draft}
				markedAsDraft={markedAsDraft}
			/>

		</form>

		<!-- Loading Radial -->
		<!-- this is not a really good solution...	-->
		{#if isSubmitting}
			<div class="col-span-full relative w-full">
				<div class="absolute right-0 -top-[50px] z-10 bg-white pr-8 pl-20 py-3">
					<ProgressRadial font={12} width="w-10"/>
				</div>
			</div>
		{/if}
	</div>

{:else}
	<PublishConfirmation
		bind:showDraftMessage={showDraftMessage}
		username={loggedUser.username}
		formId={form?.id}
	/>
{/if}

<style>
    .form-container {
        position: relative;
    }
</style>
