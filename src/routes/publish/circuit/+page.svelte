<script lang="ts">
	import { CircuitComponent, Meta } from '$lib';
	import type { ActionData, PageServerData } from './$types';
	import type { Tag as PrismaTag, User } from '@prisma/client';
	import type { NodeDiffActions } from '$lib/database';
	import { page } from '$app/state';
	import { onDestroy, onMount, tick } from 'svelte';
	import type { NodeInfo } from '$lib/components/circuits/methods/CircuitTypes';


	import {
		saveCircuitSnapshot, getCircuitSnapshot, type FormSnapshot, clearIfTimeExceeded
	} from '$lib/util/indexDB';
	import { validateMetadata } from '$lib/util/validatePublication';
	import PublishWorkflow from '$lib/components/publication/publish/PublishWorkflow.svelte';
	import type { ParamsImmutable, ParamsMutable, ParamsMutableCircuit } from '$lib/util/frontendTypes.ts';
	import type { CourseWithCoverPic } from '$lib/database/courses.ts';

	export let form: ActionData;
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

	let dataCircuit: ParamsMutableCircuit = {
		circuitData: {numNodes: 0, add: [], delete: [], edit: [], next: []},
		coverPic: undefined,
		nodeInfo: [],
	};


	let paramsMutable: ParamsMutable= {
		isSubmitting,
		title,
		loggedUser,
		searchableUsers,
		LOs,
		PKs,
		maintainers: additionalMaintainers,
		tags,
		newTags,
		description,
		fileComments: { // currently we do not have logs for circuits, initialise them as empty
			added: {},
			deleted: {}
		},
		globalComment: ""
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
	};



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
				 bind:dataCircuit={dataCircuit}
				 edit={false}
				 paramsImmutable={paramsImmutable}
				 bind:showAnimation={showAnimation}
				 circuit={true}/>

