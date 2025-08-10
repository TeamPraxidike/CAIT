<script lang="ts">
	import type { LayoutServerData } from '../$types';
	import type { ActionData, PageServerData } from './$types';
	import {
		type Difficulty,
		type Publication,
		PublicationType,
		type Tag as PrismaTag,
		type User
	} from '@prisma/client';
	import { CircuitComponent, DifficultySelection, Filter, Meta, TheoryAppBar } from '$lib';
	import {
		FileButton, getToastStore, ProgressRadial
	} from '@skeletonlabs/skeleton';
	import { appendFile, base64ToFile, concatFileList, createFileList } from '$lib/util/file';
	import type { PublicationView } from '../+layout.server';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import MetadataLOandPK from '$lib/components/MetadataLOandPK.svelte';
	import MantainersEditBar from '$lib/components/user/MantainersEditBar.svelte';
	import { onMount } from 'svelte';
	import type { FetchedFileArray, NodeDiffActions } from '$lib/database';
	import TagsSelect from "$lib/components/TagsSelect.svelte";
	import { isMaterialDraft, validateMetadata } from '$lib/util/validatePublication';
	import { SvelteFlowProvider } from '@xyflow/svelte';
	import type { NodeInfo } from '$lib/components/circuits/methods/CircuitTypes';
	import {
		type FileTUSMetadata,
		type FormSnapshot,
		getCircuitSnapshot,
		saveCircuitSnapshot
	} from '$lib/util/indexDB';
	import { allUploadsDone } from '$lib/util/file'
	import Banner from '$lib/components/publication/Banner.svelte';
	import UploadFilesForm from '$lib/components/publication/UploadFilesForm.svelte';
	import SelectType from '$lib/components/publication/SelectType.svelte';
	import SelectCourse from '$lib/components/publication/SelectCourse.svelte';
	import { changeCourse } from '$lib/util/coursesLogic';



	// $: ({loggedUser} = data);
	let loggedUser = page.data.loggedUser;
	export let data: LayoutServerData & PageServerData;
	let serverData: PublicationView = data.pubView;
	let publication: Publication = serverData.publication;
	let supabaseClient: any = page.data.supabase;

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

	const isMaterial : boolean = serverData.isMaterial;

	let fileURLs: string[] = isMaterial ? data.pubView.publication.materials.fileURLs.map((x) => x.url) : [];
	let fileTUSMetadata: { [key: string] : FileTUSMetadata } = {}

	let circuitKey = Date.now();

	let circuitNodesPlaceholder: NodeInfo[] = [];
	if (!isMaterial){
		circuitNodesPlaceholder = serverData.publication.circuit.nodes.map(node => ({
			id: node.publication.id,
			title: node.publication.title,
			username: node.publication.publisher.username,
			isMaterial: node.publication.type === PublicationType.Material,
			next: node.next,
			posX: node.posX,
			posY: node.posY,
			extensions: node.extensions,
			publisherId: node.publication.publisherId
		}))
	}
	$: circuitNodesPlaceholder = circuitNodesPlaceholder;

	let dataTransferPromise: Promise<void> | null = null;

	async function defineDataTransfer(): Promise<DataTransfer>{
		const localDataTransfer = new DataTransfer();

		for (const f of fetchedFiles){
			fileTUSMetadata[f.name] = {
				originalName: f.name,
				generatedName: f.fileId,
				isDone: true
			}

			const { data: blob, error } = await supabaseClient
				.storage
				.from("uploadedFiles")
				.download(f.fileId);

			if (error) {
				console.error('Error downloading file from Supabase:', error.message);
				throw error;
			}

			if (!blob) {
				console.error('Download succeeded but the returned blob is null.');
				return null;
			}

			const file = new File([blob], f.name, {
				type: blob.type,
			});

			localDataTransfer.items.add(file);
		}

		return localDataTransfer
	}

	onMount(async () => {
		if (isMaterial){
			theoryApp = serverData.publication.materials.theoryPractice;
			time = serverData.publication.materials.timeEstimate;
			copyright = serverData.publication.materials.copyright;
			selectedType = serverData.publication.materials.encapsulatingType;

			fetchedFiles = await data.fetchedFiles;

			dataTransferPromise = defineDataTransfer().then(dt => {
				files = dt.files;
			});


			}
	})

	let previousCourse: number | null = null;
	$: if (course !== previousCourse) {
		({ course, previousCourse, LOs, PKs } = changeCourse(course, previousCourse, LOs, PKs, data.courses));
	}


	let coverPicMat:File|undefined = undefined;
	const defaultCoverPicturePath = "/defaultCoverPic/assignment.jpg"
	let selectedFileList: FileList = [] as unknown as FileList;

	if (isMaterial){
		// TODO: (random?) figure out why the type is a string rather than a null
		if ((typeof serverData.coverFileData.data === "string" && serverData.coverFileData.data != 'null') ||
			(typeof serverData.coverFileData.data !== "string" && serverData.coverFileData.data != null)){
			coverPicMat = base64ToFile(serverData.coverFileData.data, 'cover.jpg', 'image/jpeg');
		}
	}
	let allTypes: {id:string, content:string }[] = ["presentation", "code", "video", "assignment", "dataset", "exam"].map(x => ({id : '0', content : x})); //array with all the tags MOCK


	function chooseCover(e: Event) {
		const input = e.target as HTMLInputElement;
		if (!input.files?.length) return;

		const file = input.files[0];

		// Check if file is valid
		if (file.type === 'image/jpeg' || file.type === 'image/png') {
			coverPicMat = file;

			// If you add a picture and then remove it
			// You cannot re-add it until you select another image (and remove it)
			// this is a workaround, think of it as deleting some cache
			input.value = '';

			// Update the FileList using DataTransfer
			const dataTransfer = new DataTransfer();
			dataTransfer.items.add(file);
			selectedFileList = dataTransfer.files;
		} else {
			toastStore.trigger({
				message: 'Invalid file type, please upload a .jpg or .png file',
				background: 'bg-warning-200'
			});
		}
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


	let circuitRef : InstanceType<typeof CircuitComponent>;
	$: circuitRef = circuitRef;

	let nodeActions:NodeDiffActions = {add:[], delete:[], edit:[], numNodes:0, next:[]}

	if (!isMaterial){
		nodeActions.numNodes = serverData.publication.circuit.numNodes;
		for (const node of serverData.publication.circuit.nodes){
			nodeActions.add.push(({ publicationId: node.publicationId, x: node.posX, y: node.posY }));
			nodeActions.next.push({fromId: node.publicationId, toId: node.next.map(x=>x.toPublicationId)});
		}
	}

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
	$: draft = (isMaterial && isMaterialDraft(metadata, fileLength)) || !validateMetadata(metadata);

	let isSubmitting: boolean = false;
</script>


<Meta title={publication.title} description="CAIT" type="site" />

{#if isMaterial}
	<div class="col-span-full">
		<Banner metadata={metadata} files={fileLength}
				materialType={metadata.materialType}/>
	</div>
{:else}
	<div class="col-span-full">
		<Banner metadata={metadata}
				numNodes={circuitNodesPlaceholder.length}/>
	</div>
{/if}

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

		if(isMaterial){
			// apparently files are automatically appended to the form using the
			// file key, so just remove it
			formData.delete('file')

			// check if all the file uploads (excluding cover picture) are done
			if (!(allUploadsDone(fileTUSMetadata, files))){
				// alert('Some files are still being uploaded');
				console.log("SERIOZNO LI WE");
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
		}

		formData.append('title', title);
		formData.append('description', description)
		formData.append('isMaterial', JSON.stringify(isMaterial));

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
		formData.append('coverPicMat', coverPicMat || '');


		// TODO It does have the circuit, typescript is just hating. FIX THIS
		formData.append('circuitId', JSON.stringify(serverData.publication.circuit?.id || 0));
		formData.append('materialId', JSON.stringify(serverData.publication.materials?.id || 0));
		formData.append('publisherId', JSON.stringify(serverData.publication.publisherId));
		formData.append("isDraft", JSON.stringify(markedAsDraft || draft));
		formData.append('fileURLs', JSON.stringify(fileURLs));
		formData.append('course', course ? course.toString() : 'null');


		if(circuitRef) {
			let { nodeDiffActions, coverPic } = await circuitRef.publishCircuit();
            let oldAdd = nodeActions.add;
            let newAdd = nodeDiffActions.add;
            let add = [];
            let edit = [];
            for (const node of newAdd){
                let found = false;
                for (const old of oldAdd){
                    if(old.publicationId === node.publicationId ){
                        found = true;
                        if((node.y !== old.y || node.x !== old.x)){
                                edit.push(node);
                        }
                    }
                }
                if (!found){
                    add.push(node);
                }else{
                    oldAdd = oldAdd.filter(x=>x.publicationId !== node.publicationId);
                }
            }

            const del = oldAdd;
            const numNodes = nodeDiffActions.numNodes;
            const next = nodeDiffActions.next;
            let finalDiffActions = {numNodes, add, delete:del, edit,next }

			formData.append('circuitData', JSON.stringify(finalDiffActions));
			formData.append('circuitCoverPic', JSON.stringify(coverPic));
		}

    }}>

	<h2 class="text-lg md:text-xl lg:text-2xl xl:text-3xl font-semibold">Edit Publication</h2>
	<p>{serverData.publication.publisher.firstName}</p>

	<hr class="my-10">

	<div class="flex flex-col gap-2 pl-3">
		<label for="title"> Title</label>
		<input minlength="3" type="text" id="title" name="title" bind:value={title} on:keydown={handleInputEnter}
			   class="rounded-lg dark:bg-surface-800 bg-surface-50 w-full text-surface-700 dark:text-surface-400 focus:ring-0 focus:border-primary-400">

		<label for="description"> Description</label>
		<textarea minlength="10" id="description" name="description" bind:value={description}
				  class="rounded-lg h-40 resize-y dark:bg-surface-800 bg-surface-50 w-full text-surface-700 dark:text-surface-400 focus:ring-0 focus:border-primary-400"
		></textarea>
		{#if isMaterial}
			<SelectType bind:selectedTypes={selectedType}/>
			<hr class="m-2">
			<SelectCourse bind:selectedCourseId={course} courses={data.courses}/>
			<div class="flex gap-4 items-center mt-6">
				<DifficultySelection bind:difficulty={difficulty} />
			</div>
			<div class="flex flex-col items-start">
				<label for="practice"> Theory to Practice Ratio: <br></label>
				<TheoryAppBar bind:value={theoryApp}/>
			</div>
			<div class="flex flex-col md:flex-row col-span-full items-center gap-4">
				<div class="w-full md:w-1/2">
					<label for="estimate">Time Estimate (in minutes):</label>
					<input min="0" type="number" name="estimate" bind:value={time} on:keydown={handleInputEnter} placeholder="How much time do the materials take"
								 class="rounded-lg dark:bg-surface-800 bg-surface-50 w-full text-surface-700 dark:text-surface-400 focus:ring-0 focus:border-primary-400">
				</div>
				<div class="w-full md:w-1/2">
					<label for="copyright">Copyright License (<a href="https://www.tudelft.nl/library/support/copyright#c911762" target=”_blank”
																											 class="text-tertiary-700" > Check here how this applies to you</a>):</label>
					<input type="text" name="copyright" on:keydown={handleInputEnter} bind:value={copyright} placeholder="Leave blank if material is your own"
								 class="rounded-lg dark:bg-surface-800 bg-surface-50 w-full text-surface-700 dark:text-surface-400 focus:border-primary-400 focus:ring-0">
				</div>
			</div>
		{/if}
	</div>

	<MetadataLOandPK bind:LOs={LOs} bind:priorKnowledge={PKs} adding="{true}"/>
	<MantainersEditBar publisher={serverData.publication.publisher} bind:additionalMaintainers={maintainers} bind:searchableUsers={browsingUsers} bind:users={users}  />

	<div class="text-token w-full md:w-1/2 space-y-2 pl-3">
		<TagsSelect allTags={allTags} bind:tags={tags} bind:newTags={newTags}/>
	</div>

	{#if isMaterial}
		{#if dataTransferPromise !== null}
			{#await dataTransferPromise}
				<p class="my-8">Loading files...</p>
			{:then dataTransferAwaited}
				<div class="mt-8">
					<UploadFilesForm
						integrateWithIndexDB={false}
						fetchedFiles={fetchedFiles}
						bind:fileTUSMetadata={fileTUSMetadata}
						bind:supabaseClient={supabaseClient}
						bind:fileURLs={fileURLs}
						bind:files={files}/>
				</div>
			{:catch error}
				<!--TODO: Change color-->
				<p style="color: red">Error while loading files. Reload the page to try again</p>
			{/await}
		{/if}

		<div class="mt-4">
			<label for="coverPhoto">Cover Picture:</label>
			<img src={coverPicMat ? URL.createObjectURL(coverPicMat) : defaultCoverPicturePath} alt="Cover of publication">
			<FileButton on:change={chooseCover} bind:files={selectedFileList} name="coverPhoto">Upload File</FileButton>
			{#if coverPicMat !== undefined}
				<button on:click={() => {
					coverPicMat = undefined;
					selectedFileList = new DataTransfer().files;
				}} type="button" class="btn">Remove</button>
			{/if}
		</div>
	{:else}
		{#key circuitKey}
			<SvelteFlowProvider>
				<CircuitComponent bind:dbNodes={circuitNodesPlaceholder} bind:this={circuitRef} publishing="{true}" bind:liked="{liked}" bind:saved={saved}/>
			</SvelteFlowProvider>
		{/key}

	{/if}

	{#if !draft }
		<div class="flex flex-row justify-end items-center gap-2">
			<p class="pl-3">Save as a draft: </p>
			<input type="checkbox" bind:checked={markedAsDraft} class="toggle toggle-primary" />
		</div>
	{/if}

	<div class="flex float-right gap-2 mt-4">
		{#if isSubmitting}
			<div class="mr-8">
				<ProgressRadial font="12" width="w-10"/>
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