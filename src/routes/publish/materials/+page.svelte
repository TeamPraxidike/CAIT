<script lang="ts">
	import { fade } from 'svelte/transition';
	import {
		FileTable,
		MaterialTypes,
		Meta,
		Tag,
		UserProp
	} from '$lib';
	import { FileButton, getToastStore, ProgressRadial, Step, Stepper } from '@skeletonlabs/skeleton';
	import { enhance } from '$app/forms';
	import type { ActionData, PageServerData } from './$types';
	import type {  Difficulty, Tag as PrismaTag } from '@prisma/client';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import MetadataLOandPK from '$lib/components/MetadataLOandPK.svelte';
	import MantainersEditBar from '$lib/components/user/MantainersEditBar.svelte';
	import SelectType from '$lib/components/publication/SelectType.svelte';
	import TagsSelect from '$lib/components/TagsSelect.svelte';
	import { onDestroy, onMount, tick } from 'svelte';
	import {type UserWithProfilePic} from '$lib/util/coursesLogic';

	import {
		clearFiles,
		clearMaterialSnapshot,
		deleteCover,
		type FormSnapshot,
		type FileTUSMetadata,
		getCover,
		getFiles,
		getMaterialSnapshot,
		saveCover,
		saveMaterialSnapshot, getFileTUSMetadata, saveFileTUSMetadata, deleteAllFileTUSMetadata
	} from '$lib/util/indexDB';
	import { allUploadsDone } from '$lib/util/file'
	import { isMaterialDraft } from '$lib/util/validatePublication';
	import Banner from '$lib/components/publication/Banner.svelte';
	import UploadFilesForm from '$lib/components/publication/UploadFilesForm.svelte';
	import SelectCourse from '$lib/components/publication/SelectCourse.svelte';
	import { changeCourse } from '$lib/util/coursesLogic';
	import CourseModal from '$lib/components/publication/CourseModal.svelte';
	import TimeEstimate from '$lib/components/publication/TimeEstimate.svelte';

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

	let courseMaintainers: UserWithProfilePic[] = [];
	let originalCourseIds: number[] = courses.map(c => c.id);
	let bannerFieldsList: string[];

	let users: UserWithProfilePic[] = data.users;
	let searchableUsers = users.filter((u) => u.id !== loggedUser.id);
	// learning objectives
	let LOs: string[] = [];
	$: LOs = LOs;

	let PKs: string[] = [];
	$: PKs = PKs;

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
	let fileTUSMetadata: { [key: string] : FileTUSMetadata } = {}
	$: fileTUSMetadata = fileTUSMetadata;
	let fileTUSProgress: { [key: string]: any } = {}
	$: fileTUSProgress = fileTUSProgress
	let fileTUSUploadObjects: { [key: string]: any } = {}
	$: fileTUSUploadObjects = fileTUSUploadObjects

	let previousCourse: number | null = null;
	$: if (course !== previousCourse) {
		maintainers = [];
		const prev_temp = previousCourse;
		previousCourse = course;
		const result = changeCourse(course, prev_temp, LOs, PKs, courses, maintainers);
		course = result.course;
		LOs = result.LOs;
		PKs = result.PKs;
		maintainers = result.maintainers;
	}


	let allTypes: { id: string, content: string }[] = MaterialTypes.map(x => ({ id: '0', content: x })); //array with all the tags MOCK

	let typeActive = false;
	// cover
	let coverPic: File | undefined = undefined;

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

	$: uid = page.data.session?.user.id;


	// TODO: I can't describe how much I hate this, needs to be redone
	// let authorizationToken: string | undefined = '';
	// $: authorizationToken = page.data.session?.access_token;

	let supabaseClient: any = page.data.supabase;
	//$: supabaseClient = page.data.supabase;

	const bucketName = "uploadedFiles"

	/* LOCK = TRUE => LOCKED */
	const locks: boolean[] = [false, false, false];

	// $: locks[0] = files ? files.length === 0 : true;
	// $: locks[1] = title.length < 1 || description.length < 1 || selectedType === "Select Type";
	// $: locks[2] = tags.length < 1 || LOs.length<1;

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
			deleteCover(),
			clearFiles(),
			clearMaterialSnapshot(),
			deleteAllFileTUSMetadata()
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


	import * as tus from 'tus-js-client'

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

			// get coverPic
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

			// if a metadata snapshot already exists, use it
			const existing = await getMaterialSnapshot();
			if (existing) {
				// TODO: This ?? business is meh, redo
				title = existing.title;
				description = existing.description;
				tags = existing.tags;
				newTags = existing.newTags;
				// LOs = existing.LOs;
				// PKs = existing.PKs;
				selectedType = existing.selectedType ?? 'Select type';
				difficulty = existing.difficulty ?? 'easy';
				maintainers = existing.maintainers;
				searchableUsers = existing.searchableUsers;
				estimate = existing.estimate ?? 0;
				copyright = existing.copyright ?? 'No copyright';
				theoryApplicationRatio = existing.theoryApplicationRatio ?? 0.5;
				fileURLs = existing.fileURLs ?? [];
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
					theoryApplicationRatio
				};

				// console.log('IN CONST SNAPSHOT');
				// console.log('Saving material snapshot:', data);
				// Store it in IndexedDB
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

	const onNextHandler = () => {
		window.scrollTo({
			top: 0,
			behavior: 'smooth'
		});
	};
	const handleInputEnter = (event: KeyboardEvent) => {
		if (event.key === 'Enter') {
			event.preventDefault();
		}
	};
	function openModal(courseToEdit: any = null) {
		if (courseToEdit) {
			editingCourse = courseToEdit;
			// prefill maintainers for edit (exclude current user)
			courseMaintainers = (courseToEdit.maintainers || []).filter((m: any) => m.id !== loggedUser.id);
		} else {
			editingCourse = null;
			courseMaintainers = [];
		}
		showModal = true;
	}

	function closeModal() {
		showModal = false;
	}


	// const uploadFile
	let showModal = false;
	let editingCourse: any = null;
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
			<Stepper on:submit={() => isSubmitting=true} buttonCompleteType="submit" on:step={onNextHandler}
					buttonBackLabel="← Back"
					buttonBack="btn text-surface-800 border border-surface-600 bg-surface-200 dark:text-surface-50 dark:bg-surface-600"
					buttonNextLabel="Next →"
					buttonNext="btn text-surface-50 bg-primary-600 dark:text-surface-50 dark:bg-primary-600"
					buttonCompleteLabel="Complete"
					buttonComplete="btn text-surface-50 bg-primary-600 dark:text-surface-50 dark:bg-primary-600">
				<Step locked={locks[0]}>
					<svelte:fragment slot="header">Upload files<span class="text-error-300">*</span></svelte:fragment>
					<UploadFilesForm
						supabaseURL={supabaseURL}
						bind:supabaseClient={supabaseClient}
						bind:fileTUSMetadata={fileTUSMetadata}
						bind:fileTUSProgress={fileTUSProgress}
						bind:fileTUSUploadObjects={fileTUSUploadObjects}
						bind:fileURLs={fileURLs}
						bind:files={files}/>
				</Step>
				<Step locked={locks[1]}>
					<svelte:fragment slot="header">Give your publication a title</svelte:fragment>
					<div class="grid grid-cols-2 gap-x-4 gap-y-2">
						<label for="title" class="block font-medium">Title<span class="text-error-300">*</span></label>
						<label for="coverPic" class="block font-medium">Cover Picture (Max. size: 2MB)</label>

				<div class="flex flex-col gap-2 mb-5">
					<input type="text" name="title" placeholder="Title" bind:value={title} on:keydown={handleInputEnter}
						   class="rounded-lg dark:bg-surface-800 bg-surface-50 w-full text-surface-700 dark:text-surface-400 focus:border-primary-500 focus:ring-0">
					<div class="flex flex-col gap-1">
						<label for="content" class="mt-1 block font-medium">Content<span class="text-error-300">*</span></label>
						<SelectType bind:selectedTypes={selectedTypes}/>
						<hr class="my-3 mx-2">
						<label for="course" class="block font-medium">Course<span class="text-error-300">*</span></label>
						<SelectCourse on:showCourseModal={() => openModal(null)}
						  bind:selectedCourseId={course}
						  courses={courses}
						  allCourses={data.allCourses}
						  bind:originalCourseIds={originalCourseIds}
						  on:courseEditRequest={(event) => {
							openModal(event.detail.course);
						  }}
						  on:courseDeleted={(event) => {
							  courses = courses.filter(c => c.id !== event.detail.courseId);
							  courses = [...courses];
						  }}
						/>
					</div>
				</div>

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
					</div>
				</Step>
				<Step locked={locks[2]}>
					<svelte:fragment slot="header">Fill in meta information</svelte:fragment>
					<div class="flex flex-col gap-6 mt-3">
						<div class="flex flex-col md:flex-row col-span-full items-center gap-10">
							<TimeEstimate bind:totalMinutes={estimate}/>
							<div class="w-full md:w-1/2	">
								<label for="copyright md-2" class="block font-medium">Copyright License (<a
									href="https://www.tudelft.nl/library/support/copyright#c911762" target=”_blank”
									class="text-tertiary-700"> Check here how this applies to you</a>):</label>
								<input type="text" name="copyright" bind:value={copyright} on:keydown={handleInputEnter}
									   placeholder="Leave blank if material is your own"
									   class="mt-1 rounded-lg dark:bg-surface-800 bg-surface-50 w-full text-surface-700 dark:text-surface-400 focus:border-primary-500 focus:ring-0">
							</div>
						</div>
						<div class="w-full">
							<MetadataLOandPK bind:LOs={LOs} bind:priorKnowledge={PKs}
											 adding="{true}"/>
						</div>
						<div class="w-full">
							<MantainersEditBar publisher={loggedUser} bind:searchableUsers={searchableUsers} users={users}
											   bind:additionalMaintainers={maintainers} />
						</div>
						<div class="lg:w-1/2">
							<TagsSelect allTags={allTags} bind:tags={tags} bind:newTags={newTags}/>
						</div>
						
						<textarea name="description" placeholder="Additional Description..." bind:value={description}
								  class="min-h-60 rounded-lg h-full resize-y dark:bg-surface-800 bg-surface-50 w-full text-surface-700 dark:text-surface-200 focus:border-primary-500 focus:ring-0" />
					</div>
				</Step>
				<Step locked={isSubmitting}>
					<svelte:fragment slot="header">Review</svelte:fragment>
					<div class="grid grid-cols-12 gap-8">
						<div class="col-span-8 flex flex-col">
							<h2 class="text-3xl font-semibold break-words">{title}</h2>

							<div class="flex flex-wrap gap-2 text-sm my-2">
								{#each tags as tag}
									<Tag tagText="{tag}" removable="{false}" width="{12}" />
								{/each}
							</div>

							<p class="text-surface-800 text-sm">{description}</p>

							<p class="text-surface-500 text-sm">
								Time Estimate: {estimate || 'No estimate provided'} |
								Type: {selectedType?.toUpperCase() || 'No type provided'} |
								Difficulty: {difficulty?.toLowerCase() || 'No difficulty provided'}
							</p>

							<FileTable operation="view" fileFormat="upload" bind:files={files} bind:fileURLs={fileURLs}
									   bind:fileTUSMetadata={fileTUSMetadata} bind:fileTUSProgress={fileTUSProgress}
									   bind:fileTUSUploadObjects={fileTUSUploadObjects} bind:supabaseClient={supabaseClient}/>
						</div>
						<div class="col-span-4 flex flex-col gap-4">
							{#if coverPic}
								<p class="font-bold"> Cover Picture: </p>
								<img src={URL.createObjectURL(coverPic)} alt="">
							{/if}
							<div class="flex flex-col">
								<span class="font-bold">Maintainers:</span>
								<div class="flex flex-wrap">
									<UserProp role="Publisher" view="publish" user={loggedUser} userPhotoUrl={loggedUser.profilePicData} />
									{#each maintainers as maintainer (maintainer.id)}
										<UserProp user={maintainer} view="publish" role="Publisher" userPhotoUrl={maintainer.profilePicData} />
									{/each}
								</div>
							</div>
							<div class="flex flex-col">
								<span class="font-bold">Learning Objectives:</span>
								<ul class="list-inside">
									{#each LOs as lo}
										<li class="list text-sm list-disc">{lo}</li>
									{/each}
								</ul>
							</div>
							<div class="flex flex-col">
								<span class="font-bold">Prior Knowledge:</span>
								<ul class="list-inside">
									{#each PKs as pk}
										<li class="list text-sm list-disc">{pk}</li>
									{/each}
								</ul>
							</div>
							<div class="flex flex-col">
								<span class="font-bold">Copyright:</span>
								<span class="text-sm">{copyright || 'No copyright license'}</span>
							</div>
						</div>
					</div>

					{#if !draft}
						<div class="flex flex-row justify-end items-center gap-2">
							<p class="pl-3">Save as a draft: </p>
							<input type="checkbox" bind:checked={markedAsDraft} class="toggle toggle-primary" />
						</div>
					{/if}

				</Step>
			</Stepper>
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
	<div class="fade-overlay col-span-full pt-20"
		 in:fade={{ delay: 600, duration: 400 }} out:fade={{duration: 300}}>
		<div class="logo-container">
			<img src="/images/about/CAIT_Logo_nobg.png" alt="Success" class="logo">
		</div>
		<div class="success-text">Publication uploaded successfully</div>
		<div class="success-subtext">
			{#if bannerFieldsList.length !== 0 || markedAsDraft}
				Your publication has been saved as a draft - only you can see it
			{:else}
				Your publication is now visible to all users of CAIT
			{/if}
		</div>
		<div class="button-container">
			<button type="button" class="success-btn
				bg-primary-600 text-surface-50 border-2 border-primary-600
				hover:opacity-60 transition duration-400;" on:click={() => {
					// showAnimation = false;
					goto('/publish');
				}}>
				Publish something else
			</button>
			<button type="button" class="success-btn
				bg-[#fcfcfd] text-black border-2 border-[#007393]
				hover:opacity-60 transition duration-400;" on:click={() => {
					// showAnimation = false;
					goto(`/${loggedUser.username}/${form?.id}`);
				}}>
				View publication
			</button>
		</div>
	</div>
{/if}

<style>
    .form-container {
        position: relative;
    }

    .fade-overlay {
        position: relative;
        width: 100%;
        height: 100%;
        z-index: 40;
        background: transparent;
        filter: saturate(0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        gap: 2rem;
    }

    .logo-container {
        opacity: 0;
        animation: slide-in-logo 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.3s forwards;
    }

    .logo {
        width: 200px;
        height: 200px;
        max-width: 80vw;
        max-height: 80vh;
        object-fit: contain;
    }

    .success-text {
        color: black;
        font-size: 1.5rem;
        font-weight: 500;
        text-align: center;
        opacity: 0;
        animation: slide-in-content 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.5s forwards;
    }

    .success-subtext {
        color: black;
        font-size: 1.0rem;
        font-weight: 350;
        text-align: center;
        opacity: 0;
        animation: slide-in-content 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.5s forwards;
    }

    .button-container {
        display: flex;
        gap: 1rem;
        justify-content: center;
        align-items: center;
        flex-wrap: wrap;
        opacity: 0;
        animation: slide-in-content 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.7s forwards;
    }

    .success-btn {
        padding: 0.75rem 1.5rem;
        border-radius: 0.5rem;
        font-weight: 600;
        font-size: 1rem;
        cursor: pointer;
        min-width: 160px;
        text-align: center;
        transition: background-color 0.3s ease, opacity 0.3s ease, border-color 0.3s ease;
    }


    @keyframes slide-in-logo {
        from {
            transform: scale(0.4) translateY(20px);
            opacity: 0;
        }
        to {
            transform: scale(1) translateY(0);
            opacity: 1;
        }
    }

    @keyframes slide-in-content {
        from {
            transform: translateY(20px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }

    @media (max-width: 640px) {
        .button-container {
            flex-direction: column;
            gap: 0.75rem;
        }
    }

    @media (max-width: 768px) {
        .logo {
            width: 150px;
            height: 150px;
        }

        .success-text {
            font-size: 1rem;
        }

        .success-subtext {
            font-size: 0.75rem;
        }
    }
</style>

{#if showModal}
	<CourseModal existingCourse={editingCourse} close={closeModal} publisher={loggedUser} bind:searchableUsers={searchableUsers} users={users}
				 bind:additionalMaintainers={courseMaintainers}
				 on:courseDeleted={(event) => {
					const id = event.detail.courseId;
					courses = courses.filter(c => c.id !== id);
					originalCourseIds = originalCourseIds.filter(x => x !== id);
					if (course === id) course = null;
				}}
	/>
{/if}

