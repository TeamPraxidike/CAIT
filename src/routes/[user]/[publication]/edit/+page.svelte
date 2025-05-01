<script lang="ts">
	import type { LayoutServerData } from '../$types';
	import type { ActionData, PageServerData } from './$types';
	import type { Difficulty, Publication, Tag as PrismaTag, User } from '@prisma/client';
	import { DifficultySelection, FileTable, Filter, Meta, TheoryAppBar } from '$lib';
	import {
		FileButton, FileDropzone, getToastStore
	} from '@skeletonlabs/skeleton';
	import { appendFile, base64ToFile, concatFileList, createFileList } from '$lib/util/file';
	import type { PublicationView } from '../+layout.server';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import MetadataLOandPK from '$lib/components/MetadataLOandPK.svelte';
	import MantainersEditBar from '$lib/components/user/MantainersEditBar.svelte';
	import { onMount } from 'svelte';
	import type { NodeDiffActions } from '$lib/database';
	import TagsSelect from "$lib/components/TagsSelect.svelte";
	import { isMaterialDraft, validateMetadata } from '$lib/util/validatePublication';



	// $: ({loggedUser} = data);
	let loggedUser = $page.data.loggedUser;
	export let data: LayoutServerData & PageServerData;
	let serverData: PublicationView = data.pubView;
	// console.log(data)
	// console.log("----------")
	// console.log(serverData);
	// console.log("----------")
	let publication: Publication = serverData.publication;

	let tags: string[] = serverData.publication.tags.map(tag => tag.content);

	let title = publication.title;
	let description = publication.description;
	let theoryApp:any;
	let time:any;
	let copyright:any;
	let selectedType:any;
	let files: FileList;
	let oldFiles: any;
	let fetchedFiles: any;


	let LOs: string[] = serverData.publication.learningObjectives;
	let PKs: string[] = serverData.publication.prerequisites;
	let difficulty: Difficulty = serverData.publication.difficulty;
	type UserWithProfilePic = User & { profilePicData: string };

	let maintainers:UserWithProfilePic[] = serverData.publication.maintainers;
	let users: UserWithProfilePic[] = data.users
	let browsingUsers = users.filter(x => !maintainers.map(y=>y.id).includes(x.id));

	const isMaterial : boolean = serverData.isMaterial

	if (isMaterial){
		theoryApp = serverData.publication.materials.theoryPractice;
		time = serverData.publication.materials.timeEstimate;
		copyright = serverData.publication.materials.copyright;
		selectedType = serverData.publication.materials.encapsulatingType;
		(async () => {
			fetchedFiles = await data.fetchedFiles;
			// console.log(fetchedFiles);
			// console.log("----------");
			// console.log("serverData.publication.materials.files")
			// console.log(serverData.publication.materials.files);
			// console.log("----------")
			//files = createFileList(serverData.fileData, serverData.publication.materials.files);
			files = createFileList(fetchedFiles, serverData.publication.materials.files);
			oldFiles = serverData.publication.materials.files
			// console.log(oldFiles)
		})();
	}

	let coverPicMat:File|undefined = undefined;
	const defaultCoverPicturePath = "/defaultCoverPic/assignment.jpg"
	let selectedFileList: FileList = [];

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
		toastStore.trigger({
			message: 'Publication Edited successfully',
			background: 'bg-success-200',
			classes: 'text-surface-900',
		});
		goto(`/${loggedUser.username}/${publication.id}`);
	} else if (form?.status === 400) {
		toastStore.trigger({
			message: `Malformed information, please check your inputs: ${form?.message}`,
			background: 'bg-warning-200'
		});
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


	let circuitRef : InstanceType<typeof Circuit>;
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
		window.addEventListener('beforeunload', handleBeforeUnload);

		return () => {
			window.removeEventListener('beforeunload', handleBeforeUnload);
		};
	});

	const handleInputEnter = (event: KeyboardEvent) => {
		if(event.key === 'Enter'){
			event.preventDefault();
		}
	}

	const locks: boolean[] = [true, true, true, true];
	$: locks[0] = isMaterial ? files?.length === 0 : false;
	$: locks[1] = title.length < 1 || description.length < 1 || (isMaterial && selectedType === "Select Type");
	$: locks[2] = tags.length < 1 || LOs.length < 1;


	// Warning messages for missing fields
	let warning1: string = "";
	const generateWarningStep1 = (title: string, description: string, selectedType: string): string => {
		let warning = "You are missing ";
		if (title.length < 1) warning += "a title";
		if (description.length < 1 && title.length < 1) warning += ", a description";
		else if(description.length < 1) warning += "a description";
		if ((title.length < 1 || description.length < 1) && selectedType === "Select Type") warning += " and a material type";
		else if (selectedType === "Select Type") warning += "a material type";
		warning += ".";
		return warning;
	}
	$: warning1 = generateWarningStep1(title, description, selectedType);

	let warning2: string = "";
	const generateWarningStep2 = (tags: number, LOs: number) => {
		let warning = "You are missing ";
		if (tags < 1) warning += "a tag";
		if (LOs < 1 && tags < 1) warning += " and a Learning Objective";
		else if (LOs < 1) warning += "a Learning Objective";
		return warning += ".";
	}
	$: warning2 = generateWarningStep2(tags.length, LOs.length);

	let markedAsDraft = false; // user has marked as draft
	let draft = true; // it is missing something so it is a draft
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
	$: draft = (isMaterial && isMaterialDraft(metadata, fileLength)) || !validateMetadata(metadata);
</script>


<Meta title={publication.title} description="CAIT" type="site" />

<form action="?/edit" method="POST" enctype="multipart/form-data"
	  class="col-span-full my-20"
	  use:enhance={async ({ formData }) => {


		if (locks[0] || locks[1] || locks[2]) {
			toastStore.trigger({
				message: "Please complete all required fields before submitting.",
				background: "bg-warning-200"
			});
			return;
		}


		if(isMaterial){
      		Array.from(files).forEach(file => appendFile(formData, file, 'file'));
		}

		formData.append('title', title);
		formData.append('description', description)
		formData.append('isMaterial', JSON.stringify(isMaterial));

		formData.append('oldFiles', JSON.stringify(oldFiles));
		//formData.append('oldFilesData', JSON.stringify(serverData.fileData));
		formData.append('oldFilesData', JSON.stringify(fetchedFiles));

		formData.append('userId', $page.data.session?.user.id.toString() || '');
		formData.append('tags', JSON.stringify(tags));
		formData.append('newTags', JSON.stringify(newTags))
		formData.append('difficulty', difficulty);
		formData.append('maintainers', JSON.stringify(maintainers.map(x=>x.id)));
		formData.append('learning_objectives', JSON.stringify(LOs));
		formData.append('PK', JSON.stringify(PKs));
		formData.append('theoryAppRatio', JSON.stringify(theoryApp));
		formData.append('timeEstimate', time);
		formData.append('copyright', copyright);
		formData.append('type', selectedType);
		formData.append('coverPicMat', coverPicMat || '');

		formData.append('circuitId', JSON.stringify(serverData.publication.circuit?.id || 0));
		formData.append('materialId', JSON.stringify(serverData.publication.materials?.id || 0));
		formData.append('publisherId', JSON.stringify(serverData.publication.publisherId));
		formData.append("isDraft", JSON.stringify(markedAsDraft || draft));

		if(circuitRef){
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
		{#if isMaterial}
			<label for="type"> Type</label>
			<Filter label="Type" profilePic="{false}" oneAllowed={true} bind:selectedOption={selectedType} bind:all={allTypes} selected={[]} num="{0}"/>
		{/if}
		<label for="description"> Description</label>
		<textarea minlength="10" id="description" name="description" bind:value={description}
				  class="rounded-lg h-40 resize-y dark:bg-surface-800 bg-surface-50 w-full text-surface-700 dark:text-surface-400 focus:ring-0 focus:border-primary-400"
		></textarea>
		{#if isMaterial}
			<div class="flex gap-4 items-center">
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
		<div class="mt-10 mb-20 w-full">
			<FileDropzone on:change={changeFilezone} multiple name="fileInputBind" />
			<FileTable operation="edit" bind:files={files} />
		</div>
		<div class="mt-4">
			<label for="coverPhoto">Cover Picture:</label>
			<img src={coverPicMat ? URL.createObjectURL(coverPicMat) : defaultCoverPicturePath} alt="Cover image">
			<FileButton on:change={chooseCover} bind:files={selectedFileList} name="coverPhoto">Upload File</FileButton>
			{#if coverPicMat !== undefined}
				<button on:click={() => {
					coverPicMat = undefined;
					selectedFileList = new DataTransfer().files;
				}} type="button" class="btn">Remove</button>
			{/if}
		</div>
	{:else}
<!--		TODO: CAN'T UPDATE CIRCUITS ANYMORE - was never updated from cytoscape -->
<!--		<div  class="w-full">-->
<!--			<Circuit bind:this={circuitRef} publishing="{true}" nodes="{serverData.publication.circuit.nodes}"/>-->
<!--		</div>-->
	{/if}

	{#if locks[1]}
		<p class="text-error-300 dark:text-error-400">{warning1}</p>
	{/if}
	{#if locks[2]}
		<p class="text-error-300 dark:text-error-400">{warning2}</p>
	{/if}

	{#if draft}
		<p class="text-error-500 pl-3 text-right">This publication will be saved as a draft because it's incomplete.</p>
	{:else}
		<div class="flex flex-row justify-end items-center gap-2">
			<p class="pl-3">Save as a draft: </p>
			<input type="checkbox" bind:checked={markedAsDraft} class="toggle toggle-primary" />
		</div>
	{/if}

	<div class="flex float-right gap-2">
		<button type="submit" class="btn rounded-lg variant-filled-primary text-surface-50 mt-4"
				disabled={locks[0] || locks[1] || locks[2]}>
			Save Changes
		</button>
		<button type="button" on:click={()=>{window.history.back()}} class=" flex-none float-right btn rounded-lg variant-filled-surface text-surface-50 mt-4">Cancel</button>
	</div>

</form>