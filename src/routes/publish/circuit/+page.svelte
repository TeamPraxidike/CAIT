<script lang="ts">
	import { Circuit, Meta } from '$lib';
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
	import { page } from '$app/stores';
	import MetadataLOandPK from "$lib/components/MetadataLOandPK.svelte";
	import MantainersEditBar from "$lib/components/user/MantainersEditBar.svelte";

	export let data: PageServerData;

	let circuitRef : InstanceType<typeof Circuit>;
	type UserWithProfilePic = User & { profilePicData: string };

	let title = '';
	let description = '';
	let addedTags: string[] = [];
	let newTags: string[] = [];
	let additionalMaintainers: User[] = [];

	let inputChip: InputChip;
	let tagInput = '';

	let tagsDatabase = data.tags as PrismaTag[];
	let users = data.users as UserWithProfilePic[];


	type TagOption = AutocompleteOption<string, { content: string }>;
	let flavorOptions: TagOption[] = tagsDatabase.map(tag => {
		return {
			value: tag.content,
			label: tag.content
		};
	});

	let uid = $page.data.session?.user.id || 0;

	let priorKnowledge:string[] = [];
	$: priorKnowledge = priorKnowledge;

	function onInputChipSelect(e: CustomEvent<TagOption>): void {
		if (!addedTags.includes(e.detail.value)) {
			inputChip.addChip(e.detail.value);
			tagInput = '';
		}
	}

	// learning objectives
	let LOs: string[] = [];
	$: LOs = LOs;

	$: additionalMaintainers = additionalMaintainers

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
		goto(`/${$page.data.session?.user.id}/${form?.id}`);
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
				formData.append('circuitData', JSON.stringify(nodeActions));
				formData.append('coverPic', JSON.stringify(circuitCoverPic));
      }}>
	<Stepper on:next={onNextHandler} buttonCompleteType="submit">
		<Step >
			<svelte:fragment slot="header">Create the circuit</svelte:fragment>
			<Circuit nodes={[]} bind:this={circuitRef} publishing="{true}"/>
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

				<MetadataLOandPK bind:LOs={LOs} bind:priorKnowledge={priorKnowledge}/>

				<div class="flex flex-col w-full p-3">
					<MantainersEditBar users={users}/>

					<div class="flex flex-col gap-2">
						<span>Tags<span class="text-error-300">*</span>:</span>
						<div class="text-token space-y-2">
							<InputChip bind:this={inputChip} whitelist={tagsDatabase.map(t => t.content.toLowerCase())}
												 bind:input={tagInput} bind:value={addedTags} name="chips" on:invalid={handleInvalid} class="dark:bg-transparent dark:border-surface-300 dark:text-surface-300 bg-transparent text-surface-800 border-surface-700"/>
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
