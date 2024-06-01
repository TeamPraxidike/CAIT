<script lang="ts">
	import { authStore, Circuit, Meta, UserProp } from '$lib';
	import { fly } from 'svelte/transition';
	import type { PageServerData, ActionData } from './$types';
	import {enhance} from '$app/forms';
	import type { Tag as PrismaTag, User } from '@prisma/client';
	import {
	 	Autocomplete,
		type AutocompleteOption,
		getToastStore,
		InputChip,
		Step,
		Stepper
	} from '@skeletonlabs/skeleton';
	import { goto } from '$app/navigation';
	import type { NodeDiffActions } from '$lib/database';
	import Icon from '@iconify/svelte';

	export let data: PageServerData;

	let circuitRef : InstanceType<typeof Circuit>;
	let display = 'hidden';

	let title = '';
	let description = '';
	let addedTags: string[] = [];
	let newTags: string[] = [];
	let additionalMaintainers: User[] = [];

	let userName:HTMLInputElement;


	let editingPK = false;
	let editingLO = false;
	let editingIndexPK: number;
	let editingIndexLO: number;
	let editingPKText:string;
	let editingLOText:string;
	let hoverIndexPK:number;
	let hoverIndexLO: number;

	let inputChip: InputChip;
	let tagInput = '';

	let tagsDatabase = data.tags as PrismaTag[];
	let users = data.users as User[];
	let searchableUsers = users;


	type TagOption = AutocompleteOption<string, { content: string }>;
	let flavorOptions: TagOption[] = tagsDatabase.map(tag => {
		return {
			value: tag.content,
			label: tag.content
		};
	});

	let uid = $authStore.user?.id || 0;

	let priorInput: HTMLInputElement;
	let priorKnowledge:string[] = [];
	$: priorKnowledge = priorKnowledge;

	function onInputChipSelect(e: CustomEvent<TagOption>): void {
		if (!addedTags.includes(e.detail.value)) {
			inputChip.addChip(e.detail.value);
			tagInput = '';
		}
	}

	// learning objectives
	let loInput: HTMLInputElement;
	let LOs: string[] = [];
	$: LOs = LOs;

	const handleLOPress = (event: KeyboardEvent) =>{
		if (event.key === 'Enter' && loInput.value!=='' ){
			if(LOs.includes(loInput.value)){
				triggerRepeatInput("Learning Objective",loInput.value);
			}else{
				LOs = [...LOs, loInput.value];
				loInput.value = "";
				event.preventDefault();
			}

		}
	}
	const handlePriorPress = (event: KeyboardEvent) =>{
		if (event.key === 'Enter' && priorInput.value!=='' ){
			if(priorKnowledge.includes(priorInput.value)){
				triggerRepeatInput("Prior Knowledge",priorInput.value);

			}else{
				priorKnowledge = [...priorKnowledge, priorInput.value];
				priorInput.value = "";
				event.preventDefault();
			}

		}
	}
	const handleRemoveMaintainer = (index: number) => {
		const user = additionalMaintainers.filter((_,i)=> i===index)[0];
		additionalMaintainers = additionalMaintainers.filter((_,i)=>i !== index);
		searchableUsers = [...searchableUsers,user];
	}

	$: additionalMaintainers = additionalMaintainers
	$: searchableUsers = searchableUsers

	const addMaintainer = (user: User) =>{
		if(!additionalMaintainers.map(x=>x.id).includes(user.id)){
			additionalMaintainers = [...additionalMaintainers,user];
			searchableUsers = users.filter(x=> !additionalMaintainers.map(y=>y.id).includes(x.id));
			searchableUsers = searchableUsers.filter(x=>x.id!==user.id);
			userName.value = '';
			display='hidden';
		}
	}

	const handleSearchUsers = () =>{
		let text = userName.value.toLowerCase() ?? '';
		if (text === ''){
			searchableUsers = users.filter(x=> !additionalMaintainers.map(y=>y.id).includes(x.id));
		}
		else{
			searchableUsers = users.filter(x=> !additionalMaintainers.map(y=>y.id).includes(x.id));
			searchableUsers = searchableUsers.filter(x=>`${x.firstName} ${x.lastName}`.toLowerCase().includes(text ?? ''));
		}
	}

	//handle edit of PK
	const handlePKEdit = (event: KeyboardEvent) => {
		if(event.key === 'Enter'){
			if(editingPKText === ''){
				priorKnowledge = priorKnowledge.filter((_,i) => i !== editingIndexPK);
			}else{
				priorKnowledge[editingIndexPK] = editingPKText;
			}
			editingPK = false;
			editingPKText='';
			editingIndexPK = -1;
		}
	}

	//handle edit of LO
	const handleLOEdit = (event: KeyboardEvent) => {
		if(event.key === 'Enter'){
			if(editingLOText === ''){
				LOs = LOs.filter((_,i) => i !==editingIndexLO);
			}else{
				LOs[editingIndexLO] = editingLOText;
			}
			editingLO = false;
			editingLOText='';
			editingIndexLO = -1;
		}
	}

	const handleInvalid = () => {
		if(tagInput.length>0 && !addedTags.includes(tagInput)) {
			addedTags=[...addedTags,tagInput];
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

	const locks: boolean[] = [true, true];

	$: locks[0] = title.length < 2 || description.length < 10;
	$: locks[1] = addedTags.length < 2 || LOs.length < 1;
	$: priorKnowledge = priorKnowledge;
	$: LOs = LOs;

	let nodeActions: NodeDiffActions;
	let circuitCoverPic: {type: string, info: string};


	export let form: ActionData;
	const toastStore = getToastStore();

	$: if (form?.status === 200) {
		toastStore.trigger({
			message: 'Publication Added successfully',
			background: 'bg-success-200'
		});
		goto(`/${$authStore.user?.id}/${form?.id}`);
	} else if (form?.status === 500) {
		toastStore.trigger({
			message: `Malformed information, please check your inputs: ${form?.message}`,
			background: 'bg-error-200'
		});
	}
	const onNextHandler = (event:CustomEvent) =>{
		if(event.detail.step === 0){
			let {nodeDiffActions, coverPic} = circuitRef.publishCircuit();
			nodeActions = nodeDiffActions;
			circuitCoverPic = coverPic;
		}

	}
	let displayButton = false;
	let displayButtonLO = false;

	function clickOutside(node: HTMLElement): { destroy: () => void } {
		const handleClick = (event: MouseEvent) => {
			if (!node.contains(event.target as Node)) {
				if(display === "flex"){
					display = 'hidden'
				}
			}
		};

		document.addEventListener('click', handleClick, true);

		return {
			destroy() {
				document.removeEventListener('click', handleClick, true);
			}
		};
	}



</script>

<!--<Node></Node>-->
<Meta title="Publish Circuit" description="Organize publications into a circuits" type="site" />
<!--<div class="col-span-9 h-[256px]"><CircuitManual isDraggable="{true}"/></div>-->
<Circuit nodes="{[]}" bind:this = {circuitRef} publishing="{true}"/>
<!--<CircuitPureHTML/>-->
<form method="POST" action="?/publish" class="col-start-2 col-span-10 my-20 pr-10 shadow p-4"
			use:enhance={({ formData }) => {

				formData.append('publisherId', uid.toString());
        formData.append('title', title);
        formData.append('description', description);
        formData.append('difficulty', 'easy');
        formData.append('selectedTags', JSON.stringify(addedTags));
				formData.append('newTags', JSON.stringify(newTags))
        formData.append('additionalMaintainers', JSON.stringify([...additionalMaintainers.map(m => m.id), uid]));
        formData.append('learningObjectives', JSON.stringify(LOs));
				formData.append('prior', JSON.stringify(priorKnowledge));
				console.log(nodeActions);
				formData.append('circuitData', JSON.stringify(nodeActions));
				formData.append('coverPic', JSON.stringify(circuitCoverPic));
      }}>
	<Stepper on:next={onNextHandler} buttonCompleteType="submit">
		<Step >
			<svelte:fragment slot="header">Create the circuit</svelte:fragment>
			<Circuit bind:this={circuitRef} publishing="{true}"/>
		</Step>
		<Step locked="{locks[0]}">
			<svelte:fragment slot="header">Give your publication a title</svelte:fragment>
			<div class="flex flex-col gap-5 col-span-full">
				<div class="w-full space-y-1">
					<label for="circuitTitle" >Title<span class="text-error-300">*</span></label>
					<input bind:value={title} id="circuitTitle" class="rounded-lg w-full dark:bg-surface-800 bg-surface-50 text-surface-700 dark:text-surface-400 focus:ring-primary-500" placeholder="Enter title" required/>
				</div>
				<div class="w-full space-y-1">
					<label for="circuitDescription">Description<span class="text-error-300">*</span></label>
					<textarea bind:value={description} rows="5" id="circuitDescription" class="rounded-lg w-full dark:bg-surface-800 bg-surface-50 text-surface-700 dark:text-surface-400 focus:ring-primary-500" placeholder="Explain your circuit" required />
				</div>
			</div>

		</Step>
		<Step locked="{locks[1]}">
			<svelte:fragment slot="header">Additional Metadata</svelte:fragment>
			<div class="flex flex-col justify-between gap-3 col-span-full">
					<div class="flex flex-col space-y-1 w-full">
						<label for="learningObjective" >Learning Objectives<span class="text-error-300">*</span>:</label>
						<div class="w-full">
							<div class="w-full flex justify-between gap-2">
								<input on:keydown={handleLOPress}  bind:this={loInput} id="learningObjective" type="text" placeholder="Enter learning objective" class="rounded-lg dark:bg-surface-800 bg-surface-50 text-surface-700 dark:text-surface-400 w-full focus:ring-primary-500 focus:ring-1 "/>
								<button on:click={()=>{ if(LOs.includes(loInput.value)) { triggerRepeatInput("Learning Objective",loInput.value)} else { if(loInput.value!=='') {LOs = [...LOs, loInput.value]; loInput.value = "";}}}} type="button" name="add_LO" inputmode="decimal"
												class="text-center">
									<Icon icon="mdi:plus-circle" width="32" height="32"  class="bg-surface-0 text-surface-800 hover:text-surface-600" />
								</button>
							</div>

							<div class="overflow-y-auto max-h-56 mt-1 space-y-1 flex flex-col">
								{#each LOs as LO, index}
									{#if editingLO && index === editingIndexLO}
										<input class="bg-surface-200 focus:ring-0 ring-0 rounded-lg max-h-full w-full text-md" bind:value={editingLOText} on:keypress={handleLOEdit}/>
									{:else }
										<div role="table" tabindex="-1" class="p-2 flex rounded-lg justify-between bg-surface-200 items-center w-1/2 text-wrap" on:mouseenter={()=>{displayButtonLO=true; hoverIndexLO=index}} on:mouseleave={()=>{displayButtonLO=false;}}>
											<span class="relative right-1 text-base p-1 rounded-md">{LO}</span>
											{#if !editingLO && displayButtonLO && hoverIndexLO ===index}
												<div class=" items-end flex gap-2" >
													<button type="button" class="self-center rounded-lg" on:click={() => {editingLO=true; editingIndexLO=index; editingLOText=LO;}}>
														<Icon icon="mdi:pencil" width="20" height="20"  class="text-surface-700 ml-auto hover:text-opacity-85" />
													</button>
													<button type="button" class=" self-center rounded-lg" on:click={() => {LOs = LOs.filter(x=>x!==LO)}}>
														<Icon icon="mdi:trash-can" width="20" height="20" class="text-error-300 ml-auto hover:text-opacity-85" />
													</button>
												</div>
											{/if}
										</div>
									{/if}
								{/each}
							</div>
						</div>
					</div>

					<div class="w-full">
						<label for="priorKnowledge" class="mb-1" >Prior Knowledge:</label>

						<div class="flex w-full justify-between gap-2">
							<input   bind:this={priorInput} on:keydown={handlePriorPress} id="priorKnowledge" type="text" placeholder="Enter needed concept" class="rounded-lg dark:bg-surface-800 bg-surface-50 text-surface-700 dark:text-surface-400 w-full focus:ring-primary-500"/>
							<button on:click={()=>{if(priorKnowledge.includes(priorInput.value)) {triggerRepeatInput("Prior Knowledge",priorInput.value)}  if(priorInput.value!=='') {priorKnowledge = [...priorKnowledge, priorInput.value]; priorInput.value = "";}}} type="button" name="add_prior" inputmode="decimal"
											class="text-center">
								<Icon icon="mdi:plus-circle" width="32" height="32"  class="bg-surface-0 text-surface-800 hover:text-surface-600" />
							</button>
						</div>


						<div class="overflow-y-auto max-h-56 mt-1 space-y-1 flex flex-col">
							{#each priorKnowledge as pk, index}
								{#if editingPK && index === editingIndexPK}
									<input class="bg-surface-200 focus:ring-0 ring-0 rounded-lg max-h-full w-full text-md" bind:value={editingPKText} on:keypress={handlePKEdit}/>
								{:else }
									<div role="table" tabindex="-1" class="p-2 flex rounded-lg justify-between bg-surface-200 items-center w-1/2 text-wrap" on:mouseenter={()=>{displayButton=true; hoverIndexPK=index}} on:mouseleave={()=>{displayButton=false;}}>
										<p class="relative right-1 text-base p-1 rounded-md">{pk}</p>
										{#if !editingPK && displayButton && hoverIndexPK === index }
											<div class=" items-end flex gap-2" >
												<button type="button" class="self-center rounded-lg" on:click={() => {editingPK=true; editingIndexPK=index; editingPKText=pk;}}>
													<Icon icon="mdi:pencil" width="20" height="20"  class="text-surface-700 ml-auto hover:text-opacity-85" />
												</button>
												<button type="button" class=" self-center rounded-lg" on:click={() => {priorKnowledge = priorKnowledge.filter(x=>x!==pk)}}>
													<Icon icon="mdi:trash-can" width="16" height="16" class="text-error-300 ml-auto hover:text-opacity-85" />
												</button>
											</div>
										{/if}
									</div>
								{/if}
							{/each}
						</div>
					</div>

				<div class="flex flex-col w-full">
					<div class="flex flex-col gap-2 w-full">
						<span>Maintainers<span class="text-error-300">*</span>:</span>
						<div class="flex flex-wrap my-2 gap-1 items-center w-full">
							{#if $authStore.user}
								<UserProp
									user={$authStore.user} view="publish" role="Publisher" userPhotoUrl="/fdr.jpg" />
							{/if}

							{#each additionalMaintainers as maintainer,key (maintainer.id)}
								<UserProp on:removeMaintainer={()=>handleRemoveMaintainer(key)} user={maintainer} view="publish" role="Maintainer" userPhotoUrl="/fdr.jpg" />
							{/each}

							<button on:click={()=>{display='flex'}} type="button" name="add_maintainer" inputmode="decimal"
											class="rounded-lg hover:bg-opacity-85 text-center">
								<Icon icon="mdi:plus-circle" width="32" height="32"  class="bg-surface-0 text-surface-800 hover:text-surface-600" />
							</button>

							<div transition:fly={{ x: -8, duration: 300 }} use:clickOutside class="{display} flex-col overflow-y-auto max-h-full border rounded-lg dark:bg-surface-700" >
								<input on:input={handleSearchUsers} bind:this={userName} placeholder="Search for user" class="dark:text-surface-50 dark:bg-surface-600 text-surface-800 border-none rounded-lg focus:ring-0 text-sm"/>
								{#each searchableUsers as user}
									{#if user.id !== uid}
										<button type="button" class="dark:hover:text-surface-600  hover:bg-primary-100 text-start p-0.5 px-3" on:click={()=>{addMaintainer(user)}}>
											{user.firstName} {user.lastName}
										</button>
									{/if}
								{/each}
							</div>
						</div>
					</div>

					<div class="flex flex-col gap-2">
						<span>Tags<span class="text-error-300">*</span>:</span>
						<div class="text-token space-y-2">
							<InputChip bind:this={inputChip} whitelist={tagsDatabase.map(t => t.content)}
												 bind:input={tagInput} bind:value={addedTags} name="chips" class="dark:bg-transparent dark:border-surface-300 dark:text-surface-300 bg-transparent text-surface-800 border-surface-700 w-1/2" on:invalid={handleInvalid}  />
							<div class="card max-h-48 p-4 overflow-y-auto w-1/2" tabindex="-1">
								<Autocomplete bind:input={tagInput} options={flavorOptions} denylist={addedTags}
															on:selection={onInputChipSelect}  />
							</div>
						</div>
					</div>
				</div>
			</div>
		</Step>
	</Stepper>

</form>
