<script lang="ts">
	import { Circuit, Meta, PublishReview } from '$lib';
	import type { PageServerData, ActionData } from './$types';
	import {enhance} from '$app/forms';
	import type { Publication, Tag as PrismaTag, User } from '@prisma/client';
	import {
		getToastStore,
		Step,
		Stepper
	} from '@skeletonlabs/skeleton';
	import { goto } from '$app/navigation';
	import type { NodeDiffActions } from '$lib/database';
	import { page } from '$app/stores';
	import MetadataLOandPK from "$lib/components/MetadataLOandPK.svelte";
	import MantainersEditBar from "$lib/components/user/MantainersEditBar.svelte";
	import TagsSelect from "$lib/components/TagsSelect.svelte";
	import type {
		Node as PrismaNode
	} from '@prisma/client';
	import { onMount } from 'svelte';


	export let data: PageServerData;

	let circuitRef : InstanceType<typeof Circuit>;
	type UserWithProfilePic = User & { profilePicData: string };

	let title = '';
	let description = '';
	let addedTags: string[] = [];
	let newTags: string[] = [];
	let additionalMaintainers: UserWithProfilePic[] = [];

	let tagsDatabase = data.tags as PrismaTag[];
	let users = data.users as UserWithProfilePic[];
	let liked = data.liked as number[];
	let saved = data.saved.saved as number[];


	let searchableUsers = users;

	let uid = $page.data.session?.user.id || 0;

	let priorKnowledge:string[] = [];
	$: priorKnowledge = priorKnowledge;


	// learning objectives
	let LOs: string[] = [];
	$: LOs = LOs;

	$: additionalMaintainers = additionalMaintainers

	const locks: boolean[] = [true, true];

	$: locks[0] = title.length < 1 || description.length < 1;
	$: locks[1] = addedTags.length < 1|| LOs.length < 1;
	$: priorKnowledge = priorKnowledge;
	$: LOs = LOs;

	let nodeActions: NodeDiffActions;
	let circuitCoverPic: {type: string, info: string};


	export let form: ActionData;
	const toastStore = getToastStore();

	$: if (form?.status === 200) {
		toastStore.trigger({
			message: 'Circuit Added successfully',
			background: 'bg-success-200'
		});
		goto(`/${$page.data.session?.user.id}/${form?.id}`);
	} else if (form?.status === 500) {
		toastStore.trigger({
			message: `Malformed information, please check your inputs: ${form?.message}`,
			background: 'bg-error-200'
		});
	}
	const onNextHandler = async (event: CustomEvent) => {
			window.scrollTo({
				top: 0,
				behavior: 'smooth'
			});
		if (event.detail.step === 0) {
			let { nodeDiffActions, coverPic } = await circuitRef.publishCircuit();

			nodeActions = nodeDiffActions;
			console.log(nodeActions);
			circuitCoverPic = coverPic;

		}
	}
	let circuitNodesPlaceholder: (PrismaNode & {
		publication: Publication & {
			tags: { content: string }[],
			usedInCourse: { course: string }[],
			publisher: User & {profilePicData:string},
			coverPicData: string
		}
		next: {
			circuitId: number,
			fromPublicationId: number,
			toPublicationId: number
		}[]
	})[] = [];


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

<!--<Node></Node>-->
<Meta title="Publish Circuit" description="Organize publications into a circuits" type="site" />
<!--<div class="col-span-9 h-[256px]"><CircuitManual isDraggable="{true}"/></div>-->
<form method="POST" action="?/publish" class="col-span-full my-20 pr-10 shadow p-4"
			use:enhance={({ formData }) => {

				formData.append('publisherId', uid.toString());
        formData.append('title', title);
        formData.append('description', description);
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
			<Circuit bind:nodes={circuitNodesPlaceholder} bind:this={circuitRef} publishing="{true}" bind:liked="{liked}" bind:saved={saved}/>

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

				<MetadataLOandPK bind:LOs={LOs} bind:priorKnowledge={priorKnowledge} adding="{true}"/>

				<div class="flex flex-col w-1/2">
					<MantainersEditBar bind:searchableUsers={searchableUsers} users={users} bind:additionalMaintainers={additionalMaintainers}/>
						<TagsSelect allTags={tagsDatabase} bind:tags={addedTags} bind:newTags={newTags}/>
				</div>
			</div>
		</Step>
		<Step>
			<svelte:fragment slot="header">Review</svelte:fragment>
			<PublishReview bind:title={title} bind:description={description} bind:LOs={LOs}
										 bind:prior={priorKnowledge} bind:tags={addedTags}  bind:maintainers={additionalMaintainers}
			/>
		</Step>
	</Stepper>

</form>
