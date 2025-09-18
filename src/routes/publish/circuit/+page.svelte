<script lang="ts">
	import { fade } from 'svelte/transition';
	import { CircuitComponent, Meta, PublishReview } from '$lib';
	import type { ActionData, PageServerData } from './$types';
	import { enhance } from '$app/forms';
	import type { Tag as PrismaTag, User } from '@prisma/client';
	import { getToastStore, ProgressRadial, Step, Stepper } from '@skeletonlabs/skeleton';
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
		saveCircuitSnapshot, getCircuitSnapshot, clearCircuitSnapshot, type FormSnapshot, clearIfTimeExceeded
	} from '$lib/util/indexDB';
	import { validateMetadata } from '$lib/util/validatePublication';
	import Banner from '$lib/components/publication/Banner.svelte';

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
	const locks: boolean[] = [true, false, false];

	$: locks[0] = circuitNodesPlaceholder ? circuitNodesPlaceholder.length <= 1 : true;
	// $: locks[1] = title.length < 1 || description.length < 1;
	// $: locks[2] = tags.length < 1|| LOs.length < 1;


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
			// toastStore.trigger({
			// 	message: 'Circuit Added successfully',
			// 	background: 'bg-success-200',
			// 	classes: 'text-surface-900',
			// });

			showAnimation = true;
			// goto(`/${loggedUser.username}/${form?.id}`);
		}).catch(error => {
			console.error('Error clearing data:', error);
		});
		// goto(`/${loggedUser.username}/${form?.id}`);
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
			let existing = await getCircuitSnapshot();
			if (existing && await clearIfTimeExceeded(existing.lastOpened)) {
				existing = undefined; // clear snapshot locally
			}

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
					lastOpened: Date.now()
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

	let markedAsDraft = false;
	let draft = true;
	$: metadata = {
		title,
		description,
		learningObjectives: LOs,
		tags,
		isDraft: false
	};
	$: draft = !validateMetadata(metadata);

	let bannerFieldsList: string[] = [];
	let showAnimation = false;
	$: if (showAnimation) {
		// tick() waits until the DOM has been updated
		tick().then(() => {
			window.scrollTo({ top: 0, behavior: 'smooth' });
		});
	}

</script>

<!--<Node></Node>-->
<Meta title="Publish Circuit" description="Organize publications into a circuits" type="site" />

<!--<div class="col-span-9 h-[256px]"><CircuitManual isDraggable="{true}"/></div>-->

{#if !showAnimation}
	<div class="col-span-full" out:fade={{duration: 400}}>
		<Banner bind:fieldsList={bannerFieldsList} metadata={metadata} numNodes={circuitNodesPlaceholder.length}/>
	</div>

	<div class="form-container col-span-full px-5 pt-5 pb-5 shadow"
		 out:fade={{duration: 400}}>
		<form method="POST" action="?/publish"
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
			formData.append("isDraft", JSON.stringify(markedAsDraft || draft));
      }}>
	<Stepper on:submit={() => isSubmitting=true} on:next={onNextHandler} buttonCompleteType="submit"
			buttonBackLabel="← Back"
			buttonBack="btn text-surface-800 border border-surface-600 bg-surface-200 dark:text-surface-50 dark:bg-surface-600"
			buttonNextLabel="Next →"
			buttonNext="btn text-surface-50 bg-primary-600 dark:text-surface-50 dark:bg-primary-600"
			buttonCompleteLabel="Complete"
			buttonComplete="btn text-surface-50 bg-primary-600 dark:text-surface-50 dark:bg-primary-600">
		<Step locked="{locks[0]}">
			<svelte:fragment slot="header">Create the circuit</svelte:fragment>
<!--			<Circuit bind:nodes={circuitNodesPlaceholder} bind:this={circuitRef} publishing="{true}" bind:liked="{liked}" bind:saved={saved}/>-->
			{#key circuitKey}
				<SvelteFlowProvider>
					<CircuitComponent bind:dbNodes={circuitNodesPlaceholder} bind:this={circuitRef} publishing="{true}" bind:liked="{liked}" bind:saved={saved}/>
				</SvelteFlowProvider>
			{/key}
		</Step>
		<Step locked="{locks[1]}">
			<svelte:fragment slot="header">Give your publication a title</svelte:fragment>
			<div class="flex flex-col gap-5 col-span-full">
				<div class="w-full space-y-1">
					<label for="circuitTitle" class="block font-medium">Title<span class="text-error-300">*</span></label>
					<input on:keydown={handleInputEnter} bind:value={title} id="circuitTitle" class="rounded-lg dark:bg-surface-800 bg-surface-50 w-full text-surface-700 dark:text-surface-400 focus:border-primary-500 focus:ring-0" placeholder="Enter title" required/>
				</div>
				<div class="w-full space-y-1">
					<label for="circuitDescription" class="block font-medium">Description</label>
					<textarea  bind:value={description} rows="5" id="circuitDescription" class="rounded-lg dark:bg-surface-800 bg-surface-50 w-full text-surface-700 dark:text-surface-400 focus:border-primary-500 focus:ring-0" placeholder="Explain your circuit" required />
				</div>
			</div>
		</Step>
		<Step locked="{locks[2]}">
			<svelte:fragment slot="header">Additional Metadata</svelte:fragment>
			<div class="flex flex-col justify-between gap-6 col-span-full mb-6">

				<MetadataLOandPK bind:LOs={LOs} bind:priorKnowledge={priorKnowledge} adding="{true}"/>

				<div class="flex flex-col w-1/2">
					<MantainersEditBar publisher={loggedUser} bind:searchableUsers={searchableUsers} users={users} bind:additionalMaintainers={additionalMaintainers}/>
				</div>
				<div class="flex flex-col w-1/2">
					<TagsSelect allTags={allTags} bind:tags={tags} bind:newTags={newTags}/>
				</div>
			</div>
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

			{#if draft}
				<p class="text-error-500 pl-3 text-right">This publication will be saved as a draft because it's incomplete.</p>
			{:else}
				<div class="flex flex-row justify-end items-center gap-2">
					<p class="pl-3">Save as a draft: </p>
					<input type="checkbox" bind:checked={markedAsDraft} class="toggle toggle-primary" />
				</div>
			{/if}
		</Step>
	</Stepper>

</form>

		<!-- Loading Radial -->
		<!-- this is not a really good solution...	-->
		{#if isSubmitting}
			<div class="col-span-full relative w-full">
				<div class="absolute right-0 -top-[50px] z-10 bg-white pr-8 pl-20 py-3">
					<ProgressRadial font={12} width="w-10"/>
				</div>
			</div>
		{/if}
	</div>
{:else}
	<div class="fade-overlay col-span-full pt-20"
	 in:fade={{ delay: 600, duration: 400 }} out:fade={{duration: 300}}>
	<div class="logo-container">
		<img src="/images/about/CAIT_Logo_nobg.png" alt="Success" class="logo">
	</div>
	<div class="success-text">Publication uploaded successfully</div>
	<div class="success-subtext">
		{#if bannerFieldsList.length !== 0 || markedAsDraft}
			Your publication has been saved as a draft - only you can see it
		{:else}
			Your publication is now visible to all users of CAIT
		{/if}
	</div>
	<div class="button-container">
		<button type="button" class="success-btn
				bg-primary-600 text-surface-50 border-2 border-primary-600
				hover:opacity-60 transition duration-400;" on:click={() => {
					// showAnimation = false;
					goto('/publish');
				}}>
			Publish something else
		</button>
		<button type="button" class="success-btn
				bg-[#fcfcfd] text-black border-2 border-[#007393]
				hover:opacity-60 transition duration-400;" on:click={() => {
					// showAnimation = false;
					goto(`/${loggedUser.username}/${form?.id}`);
				}}>
			View publication
		</button>
	</div>
</div>
{/if}

<style>
    .form-container {
        position: relative;
    }

    .fade-overlay {
        position: relative;
        width: 100%;
        height: 100%;
        z-index: 40;
        background: transparent;
        filter: saturate(0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        gap: 2rem;
    }

    .logo-container {
        opacity: 0;
        animation: slide-in-logo 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.3s forwards;
    }

    .logo {
        width: 200px;
        height: 200px;
        max-width: 80vw;
        max-height: 80vh;
        object-fit: contain;
    }

    .success-text {
        color: black;
        font-size: 1.5rem;
        font-weight: 500;
        text-align: center;
        opacity: 0;
        animation: slide-in-content 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.5s forwards;
    }

    .success-subtext {
        color: black;
        font-size: 1.0rem;
        font-weight: 350;
        text-align: center;
        opacity: 0;
        animation: slide-in-content 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.5s forwards;
    }

    .button-container {
        display: flex;
        gap: 1rem;
        justify-content: center;
        align-items: center;
        flex-wrap: wrap;
        opacity: 0;
        animation: slide-in-content 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.7s forwards;
    }

    .success-btn {
        padding: 0.75rem 1.5rem;
        border-radius: 0.5rem;
        font-weight: 600;
        font-size: 1rem;
        cursor: pointer;
        min-width: 160px;
        text-align: center;
        transition: background-color 0.3s ease, opacity 0.3s ease, border-color 0.3s ease;
    }


    @keyframes slide-in-logo {
        from {
            transform: scale(0.4) translateY(20px);
            opacity: 0;
        }
        to {
            transform: scale(1) translateY(0);
            opacity: 1;
        }
    }

    @keyframes slide-in-content {
        from {
            transform: translateY(20px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }

    @media (max-width: 640px) {
        .button-container {
            flex-direction: column;
            gap: 0.75rem;
        }
    }

    @media (max-width: 768px) {
        .logo {
            width: 150px;
            height: 150px;
        }

        .success-text {
            font-size: 1rem;
        }

        .success-subtext {
            font-size: 0.75rem;
        }
    }
</style>
