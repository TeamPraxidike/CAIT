<script lang="ts">
	import { authStore, Circuit, Meta, UserProp } from '$lib';
	import { fade,fly } from 'svelte/transition';
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

	export let data: PageServerData;

	let circuitRef : InstanceType<typeof Circuit>;
	let display = 'hidden';

	let title = '';
	let description = '';
	let addedTags: string[] = [];
	let newTags: string[] = [];
	let additionalMaintainers: User[] = [];

	let userName:HTMLInputElement;


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
		if (event.key === 'Enter'){
			LOs = [...LOs, loInput.value];
			loInput.value = "";
			event.preventDefault();
		}
	}
	const handlePriorPress = (event: KeyboardEvent) =>{
		if (event.key === 'Enter'){
			priorKnowledge = [...priorKnowledge, priorInput.value];
			priorInput.value = "";
			event.preventDefault();
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

	const locks: boolean[] = [true, true];

	$: locks[0] = title.length < 2 || description.length < 10;
	$: locks[1] = addedTags.length < 2 || LOs.length < 1;

	// const removePopup = (event: MouseEvent) => {
	// 	if (!(event.target instanceof HTMLElement)) {
	// 		return; // Ignore if the target is not an HTMLElement
	// 	}
	// 	if(typeof userPopUp !== undefined){
	// 		let rect = userPopUp.getBoundingClientRect();
	// 		const isClickedInsideDiv = (
	// 			rect.left <= event.clientX &&
	// 			rect.right >= event.clientX &&
	// 			rect.top <= event.clientY &&
	// 			rect.bottom >= event.clientY
	// 		);
	// 		if (!isClickedInsideDiv) {
	// 			display = 'hidden';
	// 		}
	// 	}
	//
	//
	//
	// };
	//
	// onMount(() => {
	// 	if (typeof document !== 'undefined') {
	// 		document.addEventListener('click', removePopup);
	// 	}
	// });
	//
	// onDestroy(() => {
	// 	if (typeof document !== 'undefined') {
	// 		document.removeEventListener('click', removePopup);
	// 	}
	// });
	export let form: ActionData;
	const toastStore = getToastStore();

	$: if (form?.status === 200) {
		toastStore.trigger({
			message: 'Publication Edited successfully',
			background: 'bg-success-200'
		});
		goto(`/${$authStore.user?.id}/${form?.id}`);
	} else if (form?.status === 500) {
		toastStore.trigger({
			message: `Malformed information, please check your inputs: ${form?.message}`,
			background: 'bg-warning-200'
		});
	}

</script>

<!--<Node></Node>-->
<Meta title="Publish Circuit" description="Organize publications into a circuits" type="site" />
<!--<div class="col-span-9 h-[256px]"><CircuitManual isDraggable="{true}"/></div>-->
<form method="POST" action="?/publish" class="col-start-2 col-span-10 my-20 pr-10 shadow p-4"
			use:enhance={({ formData }) => {

				formData.append('publisherId', uid.toString());
        formData.append('title', title);
        formData.append('description', description);
        formData.append('difficulty', 'easy');
        formData.append('selectedTags', JSON.stringify(addedTags));
				formData.append('newTags', JSON.stringify(newTags))
        formData.append('additionalMaintainers', JSON.stringify(additionalMaintainers.map(m => m.id)));
        formData.append('learningObjectives', JSON.stringify(LOs));
				formData.append('prior', JSON.stringify(priorKnowledge));
				if(circuitRef){
						formData.append('circuitData',JSON.stringify(circuitRef.publishCircuit()));
				}
      }}>

	<Stepper buttonCompleteType="submit">
		<Step >
			<svelte:fragment slot="header">Create the circuit</svelte:fragment>
			<Circuit bind:this={circuitRef} publishing="{true}"/>
		</Step>
		<Step locked="{locks[0]}">
			<svelte:fragment slot="header">Give your publication a title</svelte:fragment>
			<div class="flex flex-col gap-5 col-span-full">
				<div class="w-full space-y-1">
					<label for="circuitTitle" >Title<span class="text-error-300">*</span></label>
					<input bind:value={title} id="circuitTitle" class="rounded-lg w-full dark:bg-surface-800 bg-surface-50 text-surface-700 dark:text-surface-400" placeholder="Enter title" required/>
				</div>
				<div class="w-full space-y-1">
					<label for="circuitDescription">Description<span class="text-error-300">*</span></label>
					<textarea bind:value={description} rows="5" id="circuitDescription" class="rounded-lg w-full dark:bg-surface-800 bg-surface-50 text-surface-700 dark:text-surface-400" placeholder="Explain your circuit" required />
				</div>
			</div>

		</Step>
		<Step locked="{locks[1]}">
			<svelte:fragment slot="header">Additional Metadata</svelte:fragment>
			<div class="flex flex-col justify-between col-span-full">
				<div class="flex gap-5">

					<div class="flex flex-col space-y-1 w-full">
						<label for="learningObjective" >Learning Objectives<span class="text-error-300">*</span>:</label>
						<div>
							<input on:keydown={handleLOPress} bind:this={loInput} id="learningObjective" type="text" placeholder="Enter learning objective" class="rounded-lg dark:bg-surface-800 bg-surface-50 text-surface-700 dark:text-surface-400 w-3/4"/>
							<button on:click={()=>{LOs = [...LOs, loInput.value]; loInput.value = "";}} type="button" name="add_LO" inputmode="decimal"
											class="btn bg-surface-700 text-surface-50 rounded-lg hover:bg-opacity-85 text-center">+
							</button>
							<ol class="list-decimal  bg-surface-100 dark:bg-transparent list-inside gap-2 max-h-40 overflow-y-auto w-3/4">
								{#each LOs as LO}
									<li transition:fade={{ duration: 200 }} class="dark:bg-transparent rounded-lg">
										<span class="max-w-6/7">{LO}</span>
										<button class="float-right w-1/7 hover:bg-surface-200 self-center" on:click={() => {LOs = LOs.filter(x=>x!==LO)}}>x</button>
									</li>
								{/each}
							</ol>
						</div>
					</div>

					<div class="w-full">
						<label for="priorKnowledge" class="mb-1" >Prior Knowledge:</label>
						<input bind:this={priorInput} on:keydown={handlePriorPress} id="priorKnowledge" type="text" placeholder="Enter needed concept" class="rounded-lg dark:bg-surface-800 bg-surface-50 text-surface-700 dark:text-surface-400 w-3/4"/>
						<button on:click={()=>{priorKnowledge = [...priorKnowledge, priorInput.value]; priorInput.value = "";}} type="button" name="add_prior" inputmode="decimal"
										class="btn bg-surface-700 text-surface-50 rounded-lg hover:bg-opacity-85 text-center">+
						</button>
						<ol class="list-decimal bg-surface-100 dark:bg-transparent list-inside gap-2 max-h-40 overflow-y-auto w-3/4">
							{#each priorKnowledge as pk}
								<li transition:fade={{ duration: 200 }}>
									<span>{pk}</span>
									<button class="float-right w-1/7 hover:bg-surface-200 self-center" on:click={() => {priorKnowledge = priorKnowledge.filter(x=>x!==pk)}}>x</button>
								</li>
							{/each}
						</ol>
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
											class="btn bg-surface-700 text-surface-50 rounded-lg hover:bg-opacity-85 text-center">+
							</button>

							<div transition:fly={{ x: -8, duration: 300 }} class="{display} flex-col overflow-y-auto max-h-full border rounded-lg dark:bg-surface-700" >
								<input on:input={handleSearchUsers} bind:this={userName} placeholder="Search for user" class="dark:text-surface-50 dark:bg-surface-600 text-surface-800 border-none rounded-lg focus:ring-0 text-sm"/>
								{#each searchableUsers as user}
									{#if user.id !== uid}
										<button class="dark:hover:text-surface-600  hover:bg-primary-100 text-start" on:click={()=>{addMaintainer(user)}}>
											{user.firstName} {user.lastName}
										</button>
									{/if}
								{/each}
								<button on:click={()=>{display='hidden'}} class="hover:underline text-error-500">Cancel</button>

							</div>
						</div>
					</div>

					<div class="flex flex-col gap-2">
						<span>Tags<span class="text-error-300">*</span>:</span>
						<div class="text-token space-y-2">
							<InputChip bind:this={inputChip} whitelist={tagsDatabase.map(t => t.content)}
												 bind:input={tagInput} bind:value={addedTags} name="chips" class="dark:bg-transparent dark:border-surface-300 dark:text-surface-300 bg-transparent text-surface-800 border-surface-700" on:invalid={() => {addedTags=[...addedTags,tagInput]; newTags=[...newTags,tagInput]; tagInput=''; }}  />
							<div class="card w-full max-h-48 p-4 overflow-y-auto" tabindex="-1">
								<Autocomplete bind:input={tagInput} options={flavorOptions} denylist={addedTags}
															on:selection={onInputChipSelect} />
							</div>
						</div>
					</div>
				</div>
			</div>
		</Step>
	</Stepper>

</form>
