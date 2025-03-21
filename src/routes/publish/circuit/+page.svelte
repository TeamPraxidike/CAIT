<script lang="ts">
	import { CircuitComponent, Meta, PublishReview } from '$lib';
	import type { ActionData, PageServerData } from './$types';
	import { enhance } from '$app/forms';
	import type { Tag as PrismaTag, User } from '@prisma/client';
	import { getToastStore, Step, Stepper } from '@skeletonlabs/skeleton';
	import { goto } from '$app/navigation';
	import type { NodeDiffActions } from '$lib/database';
	import { page } from '$app/stores';
	import MetadataLOandPK from '$lib/components/MetadataLOandPK.svelte';
	import MantainersEditBar from '$lib/components/user/MantainersEditBar.svelte';
	import TagsSelect from '$lib/components/TagsSelect.svelte';
	import { onDestroy, onMount, tick } from 'svelte';
	import { SvelteFlowProvider } from '@xyflow/svelte';
	import type { NodeInfo } from '$lib/components/circuits/methods/CircuitTypes';

	// $: ({loggedUser} = data)

	import {
		saveCircuitSnapshot, getCircuitSnapshot, clearCircuitSnapshot, type FormSnapshot
	} from '$lib/util/indexDB';

	export let data: PageServerData;

	let circuitRef : InstanceType<typeof CircuitComponent>;
	$: circuitRef = circuitRef;

	type UserWithProfilePic = User & { profilePicData: string };

	let title = '';
	let description = '';
	let tags: string[] = [];
	$: tags = tags;
	let newTags: string[] = [];
	let additionalMaintainers: UserWithProfilePic[] = [];

	let allTags: PrismaTag[] = data.tags;
	let users = data.users as UserWithProfilePic[];
	let liked = data.liked as number[];
	let saved = data.saved.saved as number[];


	let searchableUsers = users;

	let uid = $page.data.session?.user.id || 0;
	let loggedUser = $page.data.loggedUser;

	let priorKnowledge:string[] = [];
	$: priorKnowledge = priorKnowledge;


	// learning objectives
	let LOs: string[] = [];
	$: LOs = LOs;

	$: additionalMaintainers = additionalMaintainers


	/* LOCK = TRUE => LOCKED */
	const locks: boolean[] = [true, true, true];

	$: locks[0] = circuitNodesPlaceholder ? circuitNodesPlaceholder.length <= 1 : true;
	$: locks[1] = title.length < 1 || description.length < 1;
	$: locks[2] = tags.length < 1|| LOs.length < 1;
	$: locks[3] = tags.length < 1|| LOs.length < 1;

	let warning0: string = "";
	const generateWarningStep0 = (): string => {
		return "The circuit needs at least 2 nodes";
	}
	$: warning0 = generateWarningStep0();

	let warning1: string = "";
	const generateWarningStep1 = (title: string, description: string): string => {
		let warning = "You are missing ";
		if (title.length < 1) warning += "a title";
		if (description.length < 1 && title.length < 1) warning += ", a description";
		else if(description.length < 1) warning += "a description";
		warning += ".";
		return warning;
	}
	$: warning1 = generateWarningStep1(title, description);

	let warning2: string = "";
	const generateWarningStep2 = (tags: number, LOs: number) => {
		let warning = "You are missing ";
		if (tags < 1) warning += "a tag";
		if (LOs < 1 && tags < 1) warning += " and a Learning objective";
		else if (LOs < 1) warning += "a Learning objective";
		return warning += ".";
	}
	$: warning2 = generateWarningStep2(tags.length, LOs.length);

	$: priorKnowledge = priorKnowledge;
	$: LOs = LOs;

	let nodeActions: NodeDiffActions;
	let circuitCoverPic: {type: string, info: string};


	export let form: ActionData;
	const toastStore = getToastStore();

	$: if (form?.status === 200) {
		if (saveInterval) {
			window.clearInterval(saveInterval);
		}

		Promise.all([
			clearCircuitSnapshot()
		]).then(() => {
			toastStore.trigger({
				message: 'Circuit Added successfully',
				background: 'bg-success-200',
				classes: 'text-surface-900',

			});
			goto(`/${loggedUser.username}/${form?.id}`);
		}).catch(error => {
			console.error('Error clearing data:', error);
		});
		goto(`/${loggedUser.username}/${form?.id}`);
	} else if (form?.status === 500) {
		toastStore.trigger({
			message: `Malformed information, please check your inputs: ${form?.message}`,
			background: 'bg-error-200',
			classes: 'text-surface-900',

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
			circuitCoverPic = coverPic;

		}
	}
	let circuitNodesPlaceholder: NodeInfo[] = [];
	$: circuitNodesPlaceholder = circuitNodesPlaceholder;


	const handleBeforeUnload = (event: BeforeUnloadEvent) => {
		const confirmation = confirm('Data might be lost. Are you sure you want to proceed?');

		if (!confirmation) {
			event.preventDefault();
			return;
		}

	};

	const handleInputEnter = (event: KeyboardEvent) => {
		if(event.key === 'Enter'){
			event.preventDefault();
		}
	}

	let saveInterval: number | undefined = undefined;
	let circuitKey = Date.now();

	$: circuitKey = circuitKey;

	onMount(() => {
		(async () => {
			// THIS IS THE SNAPSHOT CODE (using indexedDB)

			// if a metadata snapshot already exists, use it
			const existing = await getCircuitSnapshot();
			if (existing) {
				// TODO: This ?? business is meh, redo
				title = existing.title;
				description = existing.description;
				tags = existing.tags;
				newTags = existing.newTags;
				LOs = existing.LOs;
				priorKnowledge = existing.PKs;
				additionalMaintainers = existing.maintainers;
				searchableUsers = existing.searchableUsers;
				circuitNodesPlaceholder = existing.circuitNodes ?? [];
			}

			circuitKey = Date.now();

			saveInterval = window.setInterval(() => {
				const data: FormSnapshot = {
					title,
					description,
					tags,
					newTags,
					LOs,
					// TODO: PLEASE USE THE SAME VAR NAMES FOR COMMON STUFF DEEBA MAAMU
					PKs: priorKnowledge,
					maintainers: additionalMaintainers,
					searchableUsers,
					circuitNodes: circuitNodesPlaceholder
				};

				console.log("IN CONST SNAPSHOT")

				// Store it in IndexedDB
				saveCircuitSnapshot(data);
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

	$: isSubmitting = false;

	onDestroy(() => {
		if (saveInterval) {
			window.clearInterval(saveInterval);
		}
	})

</script>

<!--<Node></Node>-->
<Meta title="Publish Circuit" description="Organize publications into a circuits" type="site" />
<!--<div class="col-span-9 h-[256px]"><CircuitManual isDraggable="{true}"/></div>-->
<form method="POST" action="?/publish" class="col-span-full my-20 pr-10 shadow p-4"
			use:enhance={({ formData }) => {
				isSubmitting = true;
				formData.append('publisherId', uid.toString());
        formData.append('title', title);
        formData.append('description', description);

        formData.append('selectedTags', JSON.stringify(tags));
		formData.append('newTags', JSON.stringify(newTags));

        formData.append('additionalMaintainers', JSON.stringify(additionalMaintainers.map(m => m.id)));
        formData.append('learningObjectives', JSON.stringify(LOs));
		formData.append('prior', JSON.stringify(priorKnowledge));

		formData.append('circuitData', JSON.stringify(nodeActions));
		formData.append('coverPic', JSON.stringify(circuitCoverPic));
      }}>
	<Stepper on:submit={() => isSubmitting=true} on:next={onNextHandler} buttonCompleteType="submit" buttonComplete="btn text-surface-50 bg-primary-500 dark:text-surface-50 dark:bg-primary-500">
		<Step locked="{locks[0]}">
			<svelte:fragment slot="header">Create the circuit</svelte:fragment>
<!--			<Circuit bind:nodes={circuitNodesPlaceholder} bind:this={circuitRef} publishing="{true}" bind:liked="{liked}" bind:saved={saved}/>-->
			{#key circuitKey}
				<SvelteFlowProvider>
					<CircuitComponent bind:dbNodes={circuitNodesPlaceholder} bind:this={circuitRef} publishing="{true}" bind:liked="{liked}" bind:saved={saved}/>
				</SvelteFlowProvider>
			{/key}
			{#if locks[0]}
				<p class="text-error-300 dark:text-error-400">{warning0}</p>
			{/if}
		</Step>
		<Step locked="{locks[1]}">
			<svelte:fragment slot="header">Give your publication a title</svelte:fragment>
			<div class="flex flex-col gap-5 col-span-full">
				<div class="w-full space-y-1">
					<label for="circuitTitle" >Title<span class="text-error-300">*</span></label>
					<input on:keydown={handleInputEnter} bind:value={title} id="circuitTitle" class="rounded-lg w-full dark:bg-surface-800 bg-surface-50 text-surface-700 dark:text-surface-400 focus:ring-primary-500" placeholder="Enter title" required/>
				</div>
				<div class="w-full space-y-1">
					<label for="circuitDescription">Description<span class="text-error-300">*</span></label>
					<textarea  bind:value={description} rows="5" id="circuitDescription" class="rounded-lg w-full dark:bg-surface-800 bg-surface-50 text-surface-700 dark:text-surface-400 focus:ring-primary-500" placeholder="Explain your circuit" required />
				</div>
			</div>

			{#if locks[1]}
				<p class="text-error-300 dark:text-error-400">{warning1}</p>
			{/if}

		</Step>
		<Step locked="{locks[2]}">
			<svelte:fragment slot="header">Additional Metadata</svelte:fragment>
			<div class="flex flex-col justify-between gap-3 col-span-full">

				<MetadataLOandPK bind:LOs={LOs} bind:priorKnowledge={priorKnowledge} adding="{true}"/>

				<div class="flex flex-col w-1/2">
					<MantainersEditBar publisher={loggedUser} bind:searchableUsers={searchableUsers} users={users} bind:additionalMaintainers={additionalMaintainers}/>
						<TagsSelect allTags={allTags} bind:tags={tags} bind:newTags={newTags}/>
				</div>
			</div>

			{#if locks[2]}
				<p class="text-error-300 dark:text-error-400">{warning2}</p>
			{/if}
		</Step>
		<Step locked={isSubmitting}>
			<svelte:fragment slot="header">Review</svelte:fragment>
			<PublishReview publisher={loggedUser} bind:title={title} bind:description={description} bind:LOs={LOs}
										 bind:prior={priorKnowledge} bind:tags={tags}  bind:maintainers={additionalMaintainers}
			/>
			{#key circuitKey}
				<SvelteFlowProvider>
					<CircuitComponent dbNodes={circuitNodesPlaceholder}  publishing='{false}' bind:liked="{liked}" bind:saved={saved}/>
				</SvelteFlowProvider>
			{/key}
		</Step>
	</Stepper>

</form>
