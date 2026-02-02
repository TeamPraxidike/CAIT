<script lang="ts">
	import { fade } from 'svelte/transition';
	import { CircuitComponent, Meta, PublishReview } from '$lib';
	import type { ActionData, PageServerData } from './$types';
	import { enhance } from '$app/forms';
	import type { Tag as PrismaTag, User } from '@prisma/client';
	import { getToastStore, ProgressRadial, Step, Stepper } from '@skeletonlabs/skeleton';
	import { goto } from '$app/navigation';
	import type { NodeDiffActions } from '$lib/database';
	import { page } from '$app/state';
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
	import PublishWorkflow from '$lib/components/publication/publish/PublishWorkflow.svelte';
	import type { ParamsImmutable, ParamsMutable, ParamsMutableMaterial } from '$lib/util/frontendTypes.ts';
	import type { CourseWithCoverPic } from '$lib/database/courses.ts';

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

	let isSubmitting: boolean = false;

	let searchableUsers = users;

	let uid = page.data.session?.user.id || '';
	const supabaseURL: string = data.PUBLIC_SUPABASE_URL;
	let supabaseClient: any = page.data.supabase;
	let loggedUser = page.data.loggedUser;

	let PKs:string[] = [];

	// learning objectives
	let LOs: string[] = [];
	$: LOs = LOs;

	$: additionalMaintainers = additionalMaintainers
	$: PKs = PKs;
	$: LOs = LOs;

	let nodeActions: NodeDiffActions;
	let circuitCoverPic: {type: string, info: string};

	let paramsMutable: ParamsMutable;
	paramsMutable = {
		isSubmitting,
		title,
		loggedUser,
		searchableUsers,
		LOs,
		PKs,
		maintainers: additionalMaintainers,
		tags,
		newTags,
		description
	}

	let paramsImmutable: ParamsImmutable;
	$: paramsImmutable = {
		liked: data.liked,
		saved: data.saved.saved,
		supabaseClient,
		supabaseURL,
		users,
		allCourses: [] as CourseWithCoverPic[],
		uid,
		form,
		allTags
	}

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
				title = existing.title;
				description = existing.description;
				tags = existing.tags;
				newTags = existing.newTags;
				LOs = existing.LOs;
				PKs = existing.PKs;
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
					PKs: PKs,
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

<PublishWorkflow bind:data={paramsMutable}
				 dataMaterial={null}
				 dataCircuit={null}
				 edit={false}
				 paramsImmutable={paramsImmutable}
				 bind:showAnimation={showAnimation}
				 circuit={true}/>


<!--<style>-->
<!--    .form-container {-->
<!--        position: relative;-->
<!--    }-->

<!--    .fade-overlay {-->
<!--        position: relative;-->
<!--        width: 100%;-->
<!--        height: 100%;-->
<!--        z-index: 40;-->
<!--        background: transparent;-->
<!--        filter: saturate(0.7);-->
<!--        display: flex;-->
<!--        align-items: center;-->
<!--        justify-content: center;-->
<!--        flex-direction: column;-->
<!--        gap: 2rem;-->
<!--    }-->

<!--    .logo-container {-->
<!--        opacity: 0;-->
<!--        animation: slide-in-logo 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.3s forwards;-->
<!--    }-->

<!--    .logo {-->
<!--        width: 200px;-->
<!--        height: 200px;-->
<!--        max-width: 80vw;-->
<!--        max-height: 80vh;-->
<!--        object-fit: contain;-->
<!--    }-->

<!--    .success-text {-->
<!--        color: black;-->
<!--        font-size: 1.5rem;-->
<!--        font-weight: 500;-->
<!--        text-align: center;-->
<!--        opacity: 0;-->
<!--        animation: slide-in-content 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.5s forwards;-->
<!--    }-->

<!--    .success-subtext {-->
<!--        color: black;-->
<!--        font-size: 1.0rem;-->
<!--        font-weight: 350;-->
<!--        text-align: center;-->
<!--        opacity: 0;-->
<!--        animation: slide-in-content 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.5s forwards;-->
<!--    }-->

<!--    .button-container {-->
<!--        display: flex;-->
<!--        gap: 1rem;-->
<!--        justify-content: center;-->
<!--        align-items: center;-->
<!--        flex-wrap: wrap;-->
<!--        opacity: 0;-->
<!--        animation: slide-in-content 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.7s forwards;-->
<!--    }-->

<!--    .success-btn {-->
<!--        padding: 0.75rem 1.5rem;-->
<!--        border-radius: 0.5rem;-->
<!--        font-weight: 600;-->
<!--        font-size: 1rem;-->
<!--        cursor: pointer;-->
<!--        min-width: 160px;-->
<!--        text-align: center;-->
<!--        transition: background-color 0.3s ease, opacity 0.3s ease, border-color 0.3s ease;-->
<!--    }-->


<!--    @keyframes slide-in-logo {-->
<!--        from {-->
<!--            transform: scale(0.4) translateY(20px);-->
<!--            opacity: 0;-->
<!--        }-->
<!--        to {-->
<!--            transform: scale(1) translateY(0);-->
<!--            opacity: 1;-->
<!--        }-->
<!--    }-->

<!--    @keyframes slide-in-content {-->
<!--        from {-->
<!--            transform: translateY(20px);-->
<!--            opacity: 0;-->
<!--        }-->
<!--        to {-->
<!--            transform: translateY(0);-->
<!--            opacity: 1;-->
<!--        }-->
<!--    }-->

<!--    @media (max-width: 640px) {-->
<!--        .button-container {-->
<!--            flex-direction: column;-->
<!--            gap: 0.75rem;-->
<!--        }-->
<!--    }-->

<!--    @media (max-width: 768px) {-->
<!--        .logo {-->
<!--            width: 150px;-->
<!--            height: 150px;-->
<!--        }-->

<!--        .success-text {-->
<!--            font-size: 1rem;-->
<!--        }-->

<!--        .success-subtext {-->
<!--            font-size: 0.75rem;-->
<!--        }-->
<!--    }-->
<!--</style>-->
