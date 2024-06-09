<script lang="ts">
	import type { LayoutServerData } from '../$types';
	import type { ActionData, PageServerData } from './$types';
	import type { Difficulty, Publication, Tag as PrismaTag, User } from '@prisma/client';
	import { Circuit, DifficultySelection, FileTable, Filter, Meta, TheoryAppBar } from '$lib';
	import {
		Autocomplete, type AutocompleteOption, FileButton, FileDropzone, getToastStore, InputChip
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



	export let data: LayoutServerData & PageServerData;
	let serverData: PublicationView = data.pubView;
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
		files = createFileList(serverData.fileData, serverData.publication.materials.files);
		oldFiles = serverData.publication.materials.files
	}
	let coverPicMat:File|undefined;
	if (isMaterial){
		coverPicMat = base64ToFile(serverData.coverFileData.data, 'cover.jpg', 'image/jpeg');
	}
	let allTypes: {id:number, content:string }[] = ["presentation", "code", "video", "assignment", "dataset", "exam"].map(x => ({id : 0, content : x})); //array with all the tags MOCK


	function chooseCover(e: Event) {
		const eventFiles = (e.target as HTMLInputElement).files;
		if (eventFiles) {
			if (eventFiles[0].type === 'image/jpeg' || eventFiles[0].type === 'image/png')
				coverPicMat = eventFiles[0];
			else
				toastStore.trigger({
					message: 'Invalid file type, please upload a .jpg or .png file',
					background: 'bg-warning-200'
				});
		}
	}


	let inputChip: InputChip;
	let allTags: PrismaTag[] = data.tags;

	type TagOption = AutocompleteOption<string, { content: string }>;

	let flavorOptions: TagOption[] = allTags.map(tag => {
		return {
			value: tag.content,
			label: tag.content
		};
	});

	let tagInput = '';

	function onInputChipSelect(e: CustomEvent<TagOption>): void {
		if (!tags.includes(e.detail.value)) {
			inputChip.addChip(e.detail.value);
			tagInput = '';
		}
	}

	export let form: ActionData;
	const toastStore = getToastStore();

	$: if (form?.status === 200) {
		toastStore.trigger({
			message: 'Publication Edited successfully',
			background: 'bg-success-200'
		});
		goto(`/${publication.publisherId}/${publication.id}`);
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
	const handleInvalid = () => {
		if(tagInput.length>0 && !tags.includes(tagInput)) {
			tags=[...tags,tagInput];
			newTags=[...newTags,tagInput];
			tagInput='';
		}
		else {
			triggerRepeatInput("Tag",tagInput);
		}
	}

	const triggerRepeatInput = (type: string,input: string)=>{
		toastStore.trigger({
			message: `${type} ${input} Already Added`,
			background: 'bg-warning-200'
		});
	}

	let circuitRef : InstanceType<typeof Circuit>;
	let nodeActions:NodeDiffActions;
	onMount(async () => {
		if (circuitRef) {
			let { nodeDiffActions, coverPic } = await circuitRef.publishCircuit();
			nodeActions = nodeDiffActions;
		}
	});

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


</script>


<Meta title={publication.title} description="CAIT" type="site" />

<form action="?/edit" method="POST" enctype="multipart/form-data"
	  class="col-span-full my-20"
	  use:enhance={async ({ formData }) => {

		if(isMaterial)
      Array.from(files).forEach(file => appendFile(formData, file, 'file'));

		formData.append('title', title);
		formData.append('description', description)
		formData.append('isMaterial', JSON.stringify(isMaterial));

		formData.append('oldFiles', JSON.stringify(oldFiles));
		formData.append('oldFilesData', JSON.stringify(serverData.fileData));

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

		formData.append('circuitId', JSON.stringify(serverData.publication.circuit?.id || 0))
		formData.append('materialId', JSON.stringify(serverData.publication.materials?.id || 0))

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
			const number = nodeDiffActions.numNodes;
			const next = nodeDiffActions.next;
			let finalDiffActions = {number, add, delete:del, edit,next }
			formData.append('circuitData', JSON.stringify(finalDiffActions));
			formData.append('circuitCoverPic', JSON.stringify(coverPic));
		}

    }}>

	<h2 class="text-lg md:text-xl lg:text-2xl xl:text-3xl font-semibold">Edit Publication</h2>
	<p>{serverData.publication.publisher.firstName}</p>

	<hr class="my-10">

	<div class="flex flex-col gap-2 pl-3">
		<label for="title"> Title</label>
		<input minlength="3" type="text" id="title" name="title" bind:value={title}
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
			<div class="flex col-span-2 items-center gap-4">
				<div class="w-1/2">
					<label for="estimate">Time Estimate (in minutes):</label>
					<input min="0" type="number" name="estimate" bind:value={time} placeholder="How much time do the materials take"
								 class="rounded-lg dark:bg-surface-800 bg-surface-50 w-full text-surface-700 dark:text-surface-400 focus:ring-0 focus:border-primary-400">
				</div>
				<div class="w-1/2">
					<label for="copyright">Copyright License (<a href="https://www.tudelft.nl/library/support/copyright#c911762" target=”_blank”
																											 class="text-tertiary-700" > Check here how this applies to you</a>):</label>
					<input type="text" name="copyright" bind:value={copyright} placeholder="Leave blank if material is your own"
								 class="rounded-lg dark:bg-surface-800 bg-surface-50 w-full text-surface-700 dark:text-surface-400 focus:border-primary-400 focus:ring-0">
				</div>
			</div>
		{/if}
	</div>

	<MetadataLOandPK bind:LOs={LOs} bind:priorKnowledge={PKs} adding="{true}"/>
	<MantainersEditBar bind:additionalMaintainers={maintainers} bind:searchableUsers={browsingUsers} bind:users={users}  />

	<div class="text-token w-1/2 space-y-2 pl-3">
		<TagsSelect allTags={allTags} bind:tags={tags} bind:newTags={newTags}/>
	</div>

	{#if isMaterial}
		<div class="mt-10 mb-20 w-full">
			<FileDropzone on:change={changeFilezone} multiple name="fileInputBind" />
			<FileTable operation="edit" bind:files={files} />
		</div>
		<div class="mt-4">
			<label for="coverPhoto">Cover Picture:</label>
			<FileButton on:change={chooseCover} name="coverPhoto">Upload File</FileButton>
			{#if coverPicMat}
				<button on:click={() => coverPicMat = undefined} type="button" class="btn">Remove</button>
				<img src={URL.createObjectURL(coverPicMat)} alt="sss">
			{/if}
		</div>
	{:else}
		<div  class="w-full">
			<Circuit bind:this={circuitRef} publishing="{true}" nodes="{serverData.publication.circuit.nodes}"/>
		</div>
	{/if}



	<div class="flex float-right gap-2">
		<button type="submit" class="btn rounded-lg variant-filled-primary text-surface-50 mt-4">Save Changes</button>
		<button type="button" on:click={()=>{window.history.back()}} class=" flex-none float-right btn rounded-lg variant-filled-surface text-surface-50 mt-4">Cancel</button>
	</div>

</form>