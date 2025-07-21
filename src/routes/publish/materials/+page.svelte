<script lang="ts">
	import {
		DifficultySelection,
		FileTable,
		MaterialTypes,
		Meta,
		Tag,
		TheoryAppBar, UserProp
	} from '$lib';
	import { FileButton, getToastStore, Step, Stepper } from '@skeletonlabs/skeleton';
	import { enhance } from '$app/forms';
	import type { ActionData, PageServerData } from './$types';
	import type {  Difficulty, Tag as PrismaTag, User } from '@prisma/client';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import MetadataLOandPK from '$lib/components/MetadataLOandPK.svelte';
	import MantainersEditBar from '$lib/components/user/MantainersEditBar.svelte';
	import SelectType from '$lib/components/publication/SelectType.svelte';
	import TagsSelect from '$lib/components/TagsSelect.svelte';
	import { onDestroy, onMount } from 'svelte';

	import {
		clearFiles,
		clearMaterialSnapshot,
		deleteCover,
		type FormSnapshot,
		getCover,
		getFiles,
		getMaterialSnapshot,
		saveCover,
		saveMaterialSnapshot
	} from '$lib/util/indexDB';
	import { isMaterialDraft } from '$lib/util/validatePublication';
	import Banner from '$lib/components/publication/Banner.svelte';
	import UploadFilesForm from '$lib/components/publication/UploadFilesForm.svelte';
	import SelectCourse from '$lib/components/publication/SelectCourse.svelte';

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


	let loggedUser = page.data.loggedUser;
	$: isSubmitting = false;

	// tags
	let tags: string[] = [];
	$: tags = tags;
	let allTags: PrismaTag[] = data.tags;
	let newTags: string[] = [];

	let files: FileList = [] as unknown as FileList;
	let fileURLs: string[] = [] as string[];
	type UserWithProfilePic = User & { profilePicData: string };
	let maintainers: UserWithProfilePic[] = [];

	let users: UserWithProfilePic[] = data.users;
	let searchableUsers = users;
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
	let estimate: string = '';
	let copyright: string = '';
	let theoryApplicationRatio: number = 0.5;
	let selectedTypes: string[] = [];
	$: selectedType = selectedTypes.length > 0 ? selectedTypes[0] : 'Select type';

	let previousCourse: number | null = null;
	$: if (course !== previousCourse) {
		// Remove learning objectives and prerequisites that are a part of the previous course
		const prevCourse = data.courses.find(c => c.id === previousCourse);
		LOs = LOs.filter(l => !prevCourse?.learningObjectives.includes(l));
		PKs = PKs.filter(p => !prevCourse?.prerequisites.includes(p));

		previousCourse = course;

		// Add learning objectives and prerequisites from the newly selected course, while keeping custom ones
		for (let i = 0; i < data.courses.length; i++) {
			if (data.courses[i].id === course) {
				const lo = new Set(LOs);
				const pk = new Set(PKs);
				data.courses[i].learningObjectives.forEach(obj => lo.add(obj));
				data.courses[i].prerequisites.forEach(obj => pk.add(obj));
				LOs = Array.from(lo);
				PKs = Array.from(pk);
				break;
			}
		}
	}


	let allTypes: { id: string, content: string }[] = MaterialTypes.map(x => ({ id: '0', content: x })); //array with all the tags MOCK

	let typeActive = false;
	// cover
	let coverPic: File | undefined = undefined;

	function chooseCover(e: Event) {
		const eventFiles = (e.target as HTMLInputElement).files;
		if (eventFiles && eventFiles[0]) {
			const file = eventFiles[0];
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



	/* LOCK = TRUE => LOCKED */
	const locks: boolean[] = [false, false, false];

	// $: locks[0] = files ? files.length === 0 : true;
	// $: locks[1] = title.length < 1 || description.length < 1 || selectedType === "Select Type";
	// $: locks[2] = tags.length < 1 || LOs.length<1;

	const toastStore = getToastStore();

	$: if (form?.status === 200) {
		if (saveInterval) {
			window.clearInterval(saveInterval);
		}

		Promise.all([
			deleteCover(),
			clearFiles(),
			clearMaterialSnapshot()
		]).then(() => {
			// Show success message
			toastStore.trigger({
				message: 'Publication Added successfully',
				background: 'bg-success-200',
				classes: 'text-surface-900'
			});

			// Navigate away
			goto(`/${loggedUser.username}/${form?.id}`);
		}).catch(error => {
			console.error('Error clearing data:', error);
		});
		goto(`/${loggedUser.username}/${form?.id}`);
	} else if (form?.status === 400) {
		toastStore.trigger({
			message: `Malformed information, please check your inputs: ${form?.message}`,
			background: 'bg-warning-200',
			classes: 'text-surface-900'
		});
	} else if (form?.status === 500) {
		toastStore.trigger({
			message: 'An error occurred, please try again later or contact support',
			background: 'bg-error-200',
			classes: 'text-surface-900'
		});
	}

	const handleBeforeUnload = (event: BeforeUnloadEvent) => {

		const confirmation = confirm('Data might be lost. Are you sure you want to proceed?');

		if (!confirmation) {
			event.preventDefault();
			return;
		}

	};

	let saveInterval: number | undefined = undefined;

	onMount(() => {
		(async () => {

			// THIS IS THE SNAPSHOT CODE (using indexedDB)

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
				estimate = existing.estimate ?? '30';
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
	// const uploadFile

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
	$: numMaterials = Math.max(fileURLs.length, files.length);
	$: draft = isMaterialDraft(metadata, numMaterials);

</script>

<Meta title="Publish" description="CAIT" type="site" />

<Banner metadata={metadata} files={numMaterials} materialType={metadata.materialType}/>

<form method="POST"
	  enctype="multipart/form-data"
	  action="?/publish"
	  class="col-span-full my-20 pr-10 shadow p-4"
	  use:enhance={({ formData }) => {
	    isSubmitting = true;
		let willSubmit = true;
        Array.from(files).forEach(file => {
          if (file.size > 1024 * 1024 * 100) {
            alert('File size exceeds 100MB');
			willSubmit = false;
          } else {
            formData.append('file', file);
          }
        });
		if (!willSubmit) return;

        formData.append('userId', uid?.toString() || '');
		formData.append('fileURLs', JSON.stringify(fileURLs));
        formData.append('title', title);
        formData.append('description', description);
		formData.append('type', JSON.stringify(selectedTypes));
        formData.append('difficulty', difficulty);
        formData.append('estimate', estimate);
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
			 buttonNext="btn dark:bg-surface-200"
			 buttonComplete="btn text-surface-50 bg-primary-500 dark:text-surface-50 dark:bg-primary-500">
				<Step locked={locks[0]}>

					<svelte:fragment slot="header">Upload files<span class="text-error-300">*</span></svelte:fragment>
					<UploadFilesForm
						bind:fileURLs={fileURLs}
						bind:files={files}/>
				</Step>
		<Step locked={locks[1]}>
			<div class="grid grid-cols-2 gap-x-4 gap-y-2">
				<label for="title">Title<span class="text-error-300">*</span></label>

				<label for="coverPic">Cover Picture</label>

				<div class="flex flex-col gap-2 min-h-80">
					<input type="text" name="title" placeholder="Title" bind:value={title} on:keydown={handleInputEnter}
						   class="rounded-lg dark:bg-surface-800 bg-surface-50 w-full text-surface-700 dark:text-surface-200">
					<textarea name="description" placeholder="Description..." bind:value={description}
							  class="min-h-60 rounded-lg h-full resize-y dark:bg-surface-800 bg-surface-50 w-full text-surface-700 dark:text-surface-200" />
				</div>

				<div class="flex flex-col gap-2 h-full bg-surface-200
							border-2 border-dashed border-surface-700">
					{#if coverPic}
						<img src={URL.createObjectURL(coverPic)}
							 alt="coverPicture"
							 class="max-h-96 w-full object-contain h-full">
					{/if}
				</div>

<!--				<Filter label="Type" profilePic="{false}" oneAllowed={true} bind:selectedOption={selectedType}-->
<!--						bind:all={allTypes} selected={[]} num="{0}" bind:active={typeActive}-->
<!--						on:clearSettings={() => {typeActive=false}} />-->
				<div class="flex flex-col gap-2">
					<SelectType bind:selectedTypes={selectedTypes}/>
					<hr class="m-2">
					<SelectCourse bind:selectedCourseId={course} courses={data.courses}/>
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

			<svelte:fragment slot="header">Give your publication a title</svelte:fragment>
		</Step>
		<Step locked={locks[2]}>
			<svelte:fragment slot="header">Fill in meta information</svelte:fragment>
			<div class="flex flex-col gap-8 p-6 justify-between">
				<div class="flex gap-4 items-center">
					<DifficultySelection bind:difficulty={difficulty} />
				</div>
				<div class="flex flex-row gap-4 md:gap-2 items-center">
					<label for="theoryRatio h-full self-center text-center">Theory Application Ratio</label>
					<TheoryAppBar bind:value={theoryApplicationRatio} />
				</div>
			</div>

			<div class="flex flex-col gap-4 p-3">
				<div class="flex flex-col md:flex-row col-span-full items-center gap-4 p-3">
					<div class="w-full md:w-1/2 flex-col gap-2">
						<label for="estimate">Time Estimate (in minutes):</label>
						<input type="number" name="estimate" bind:value={estimate} on:keydown={handleInputEnter} min="0"
							   placeholder="How much time do the materials take"
							   class="rounded-lg dark:bg-surface-800 bg-surface-50 w-full text-surface-700 dark:text-surface-400 focus:ring-0 focus:border-primary-400">
					</div>
					<div class="w-full md:w-1/2	">
						<label for="copyright md-2">Copyright License (<a
							href="https://www.tudelft.nl/library/support/copyright#c911762" target=”_blank”
							class="text-tertiary-700"> Check here how this applies to you</a>):</label>
						<input type="text" name="copyright" bind:value={copyright} on:keydown={handleInputEnter}
							   placeholder="Leave blank if material is your own"
							   class="rounded-lg dark:bg-surface-800 bg-surface-50 w-full text-surface-700 dark:text-surface-400 focus:border-primary-400 focus:ring-0">
					</div>
				</div>
				<div class="w-full">
					<MetadataLOandPK bind:LOs={LOs} bind:priorKnowledge={PKs}
									 adding="{true}"/>
				</div>
				<div class="flex flex-col w-full">
					<MantainersEditBar publisher={loggedUser} bind:searchableUsers={searchableUsers} users={users}
									   bind:additionalMaintainers={maintainers} />
					<div class="lg:w-1/2">
						<TagsSelect allTags={allTags} bind:tags={tags} bind:newTags={newTags}/>
					</div>
				</div>
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

					<FileTable bind:files={files} bind:fileURLs={fileURLs}/>
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
