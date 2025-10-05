<script lang="ts">
	import type { LayoutServerData } from '../../$types';
	import type { ActionData, PageServerData } from './$types';
	import {
		type Difficulty,
		type Publication,
		PublicationType,
		type Tag as PrismaTag,
		type User
	} from '@prisma/client';
	import { CircuitComponent, DifficultySelection, Meta, TheoryAppBar } from '$lib';
	import {
		FileButton, getToastStore, ProgressRadial
	} from '@skeletonlabs/skeleton';
	import { base64ToFile, concatFileList } from '$lib/util/file';
	import type { PublicationView } from '../../+layout.server';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import MetadataLOandPK from '$lib/components/MetadataLOandPK.svelte';
	import MantainersEditBar from '$lib/components/user/MantainersEditBar.svelte';
	import { onMount } from 'svelte';
	import type { FetchedFileArray, FetchedFileItem, NodeDiffActions } from '$lib/database';
	import TagsSelect from "$lib/components/TagsSelect.svelte";
	import { isMaterialDraft, validateMetadata } from '$lib/util/validatePublication';
	import { SvelteFlowProvider } from '@xyflow/svelte';
	import type { NodeInfo } from '$lib/components/circuits/methods/CircuitTypes';
	import {
		type FileTUSMetadata,
	} from '$lib/util/indexDB';
	import { allUploadsDone } from '$lib/util/file'
	import Banner from '$lib/components/publication/Banner.svelte';
	import UploadFilesForm from '$lib/components/publication/UploadFilesForm.svelte';
	import SelectType from '$lib/components/publication/SelectType.svelte';
	import SelectCourse from '$lib/components/publication/SelectCourse.svelte';
	import { changeCourse } from '$lib/util/coursesLogic';
	import type { SupabaseClient } from '@supabase/supabase-js';
	import PublishStepper from '$lib/components/publication/publish/PublishStepper.svelte';



	// $: ({loggedUser} = data);
	let loggedUser = page.data.loggedUser;
	export let data: LayoutServerData & PageServerData;
	let serverData: PublicationView = data.pubView;
	let publication: Publication = serverData.publication;
	let supabaseClient: any = page.data.supabase;
	const supabaseURL: string = data.PUBLIC_SUPABASE_URL;

	let tags: string[] = serverData.publication.tags.map(tag => tag.content);

	let title = publication.title;
	let description = publication.description;
	let theoryApp:any;
	let time:any;
	let copyright:any;

	let selectedType:string[];
	let files: FileList = [];

	let oldFiles: any;
	let fetchedFiles: FetchedFileArray | [] = [];

	let LOs: string[] = serverData.publication.learningObjectives;
	let PKs: string[] = serverData.publication.prerequisites;
	let course: number | null = null;
	let difficulty: Difficulty = serverData.publication.difficulty;
	type UserWithProfilePic = User & { profilePicData: string };
	let liked: number[] = [];
	let saved: number[] = [];

	let maintainers:UserWithProfilePic[] = serverData.publication.maintainers;
	let users: UserWithProfilePic[] = data.users
	let browsingUsers = users.filter(x => !maintainers.map(y=>y.id).includes(x.id));

	let fileURLs: string[] = data.pubView.publication.materials.fileURLs.map((x) => x.url);
	let fileTUSMetadata: { [key: string] : FileTUSMetadata } = {}

	let circuitKey = Date.now();

	let circuitNodesPlaceholder: NodeInfo[] = [];
	$: circuitNodesPlaceholder = circuitNodesPlaceholder;

	let dataTransferPromise: Promise<void> | null = null;

	async function downloadFileFromSupabase(f: FetchedFileItem, supabaseClient: SupabaseClient<any, 'public', any>): Promise<File>{
		const { data: blob, error } = await supabaseClient.storage
			.from("uploadedFiles")
			.download(f.fileId)

		if (error) {
			console.error('Error downloading file from Supabase:', error.message);
			throw error;
		}

		if (!blob) {
			console.error('Download succeeded but the returned blob is null.');
			return null;
		}

		return new File([blob], f.name, {
			type: blob.type,
		});
	}

	async function defineDataTransfer(): Promise<DataTransfer>{
		const localDataTransfer = new DataTransfer();

		for (const f of fetchedFiles){
			fileTUSMetadata[f.name] = {
				originalName: f.name,
				generatedName: f.fileId,
				isDone: true
			}

			const file = await downloadFileFromSupabase(f, supabaseClient)

			localDataTransfer.items.add(file);
		}

		return localDataTransfer
	}

	let coverPicPromise: null | Promise<File> = null;
	const defaultCoverPicturePath = "/defaultCoverPic/assignment.jpg"

	onMount(async () => {
		theoryApp = serverData.publication.materials.theoryPractice;
		time = serverData.publication.materials.timeEstimate;
		copyright = serverData.publication.materials.copyright;
		selectedType = serverData.publication.materials.encapsulatingType;

		fetchedFiles = await data.fetchedFiles;

		dataTransferPromise = defineDataTransfer().then(dt => {
			files = dt.files;
		});

		// TODO: (random?) figure out why the type is a string rather than a null
		if ((typeof serverData.coverFileData.data === "string" && serverData.coverFileData.data != 'null') ||
			(typeof serverData.coverFileData.data !== "string" && serverData.coverFileData.data != null)){
			coverPicPromise = downloadFileFromSupabase(serverData.coverFileData, supabaseClient);
		}
	});

	let previousCourse: number | null = null;
	$: if (course !== previousCourse) {
		({ course, previousCourse, LOs, PKs } = changeCourse(course, previousCourse, LOs, PKs, data.courses));
	}

	let allTypes: {id:string, content:string }[] = ["presentation", "code", "video", "assignment", "dataset", "exam"].map(x => ({id : '0', content : x})); //array with all the tags MOCK


	async function chooseCover(e: Event) {
		const input = e.target as HTMLInputElement;
		if (!input.files?.length) return;

		const file = input.files[0];

		// Check if file is valid
		if (file.type === 'image/jpeg' || file.type === 'image/png') {
			return file;
		} else {
			toastStore.trigger({
				message: 'Invalid file type, please upload a .jpg or .png file',
				background: 'bg-warning-200'
			});
		}

		// TODO
		// If you add a picture and then remove it
		// You cannot re-add it until you select another image (and remove it)
		// this is a workaround, think of it as deleting some cache
		input.value = '';
	}

	async function chooseCoverPromiseHandler(e: Event){
		coverPicPromise = chooseCover(e);
	}

	let allTags: PrismaTag[] = data.tags;

	export let form: ActionData;
	const toastStore = getToastStore();

	$: if (form?.status === 200) {
		isSubmitting = false;
		toastStore.trigger({
			message: 'Publication Edited successfully',
			background: 'bg-success-200',
			classes: 'text-surface-900',
		});
		goto(`/${loggedUser.username}/${publication.id}`);
	} else if (form?.status === 400) {
		isSubmitting = false;
		if (!(allUploadsDone(fileTUSMetadata, files))){
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
	} else if (form?.status === 401) {
		toastStore.trigger({
			message: `Unauthorized! ${form?.message}`,
			background: 'bg-error-200'
		});
	} else if (form?.status === 500) {
		toastStore.trigger({
			message: 'An error occurred, please try again later or contact support',
			background: 'bg-error-200'
		});
	}

	export function changeFilezone(e: Event) {
		const eventFiles = (e.target as HTMLInputElement).files;
		if (eventFiles) {
			files = concatFileList(files, eventFiles);
		}
	}
	let newTags: string[] = [];

	const handleBeforeUnload = (event: BeforeUnloadEvent) => {
		const confirmation = confirm('Data will be lost. Are you sure you want to proceed?');

		if (!confirmation) {
			event.preventDefault();
			return;
		}

	};

	onMount(() => {
		(async () => {
			window.addEventListener('beforeunload', handleBeforeUnload);

			return () => {
				window.removeEventListener('beforeunload', handleBeforeUnload);
			};
		})();
	});

	const handleInputEnter = (event: KeyboardEvent) => {
		if(event.key === 'Enter'){
			event.preventDefault();
		}
	}

	const locks: boolean[] = [false, false, false, false];
	// $: locks[0] = isMaterial ? files?.length === 0 : false;
	// $: locks[1] = title.length < 1 || description.length < 1 || (isMaterial && selectedType === "Select Type");
	// $: locks[2] = tags.length < 1 || LOs.length < 1;

	let metadata;
	$: metadata = {
		title,
		description,
		learningObjectives: LOs,
		tags,
		materialType: selectedType,
		isDraft: false
	};
	$: fileLength = files?.length;
	// it is missing something so it is a draft. First check if it is a material, then check if the metadata is valid (circuit)
	let draft = serverData.publication.isDraft;
	// user has marked as draft
	let markedAsDraft = draft;
	$: draft = isMaterialDraft(metadata, fileLength) || !validateMetadata(metadata);

	let isSubmitting: boolean = false;
</script>


<Meta title={publication.title} description="CAIT" type="site" />


<div class="col-span-full">
	<Banner metadata={metadata} files={fileLength}
			materialType={metadata.materialType}/>
</div>

<form method="POST"
	  enctype="multipart/form-data"
	  action="?/edit"
	  class="col-span-full my-20"
	  use:enhance={async ({ formData }) => {
		isSubmitting = true;

		if (locks[0] || locks[1] || locks[2]) {
			toastStore.trigger({
				message: "Please complete all required fields before submitting.",
				background: "bg-warning-200"
			});
			isSubmitting = false;
			return;
		}

		// apparently files are automatically appended to the form using the
		// file key, so just remove it
		formData.delete('file')

		// check if all the file uploads (excluding cover picture) are done
		if (!(allUploadsDone(fileTUSMetadata, files))){
			// alert('Some files are still being uploaded');
			isSubmitting = false;
			return;
		}

		// Array.from(files).forEach(file => appendFile(formData, file, 'file'));
		for (const f of files){
			 let uploadFormat = {
				title: f.name,
				type: f.type,
				info: fileTUSMetadata[f.name]['generatedName']
			}
			formData.append('file', JSON.stringify(uploadFormat));
		}


		formData.append('title', title);
		formData.append('description', description);

		//formData.append('oldFiles', JSON.stringify(oldFiles));
		//formData.append('oldFilesData', JSON.stringify(serverData.fileData));
		formData.append('oldFilesData', JSON.stringify(fetchedFiles));

		formData.append('userId', page.data.session?.user.id.toString() || '');
		formData.append('tags', JSON.stringify(tags));
		formData.append('newTags', JSON.stringify(newTags))
		formData.append('difficulty', difficulty);
		formData.append('maintainers', JSON.stringify(maintainers.map(x=>x.id)));
		formData.append('learning_objectives', JSON.stringify(LOs));
		formData.append('PK', JSON.stringify(PKs));
		formData.append('theoryAppRatio', JSON.stringify(theoryApp));
		formData.append('timeEstimate', time);
		formData.append('copyright', copyright);
		formData.append('type', JSON.stringify(selectedType));

		let coverPicMat = null
		if (coverPicPromise !== null){
			coverPicMat = await coverPicPromise;
		}
		formData.append('coverPicMat', coverPicMat);


		// TODO It does have the circuit, typescript is just hating. FIX THIS
		formData.append('circuitId', JSON.stringify(serverData.publication.circuit?.id || 0));
		formData.append('materialId', JSON.stringify(serverData.publication.materials?.id || 0));
		formData.append('publisherId', JSON.stringify(serverData.publication.publisherId));
		formData.append("isDraft", JSON.stringify(markedAsDraft || draft));
		formData.append('fileURLs', JSON.stringify(fileURLs));
		formData.append('course', course ? course.toString() : 'null');
    }}>

	<h2 class="text-lg md:text-xl lg:text-2xl xl:text-3xl font-semibold">Edit Publication</h2>
	<p>{serverData.publication.publisher.firstName}</p>

	<hr class="my-10">

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

	{#if !draft }
		<div class="flex flex-row justify-end items-center gap-2">
			<p class="pl-3">Save as a draft: </p>
			<input type="checkbox" bind:checked={markedAsDraft} class="toggle toggle-primary" />
		</div>
	{/if}

	<div class="flex float-right gap-2 mt-4">
		{#if isSubmitting}
			<div class="mr-8">
				<ProgressRadial font={12} width="w-10"/>
			</div>
		{:else}
			<button type="submit" class="btn rounded-lg variant-filled-primary text-surface-50"
					disabled={locks[0] || locks[1] || locks[2] || isSubmitting}>
				Save Changes
			</button>
		{/if}
		<button type="button" on:click={()=>{window.history.back()}} class=" flex-none float-right btn rounded-lg variant-filled-surface text-surface-50">Cancel</button>
	</div>
</form>