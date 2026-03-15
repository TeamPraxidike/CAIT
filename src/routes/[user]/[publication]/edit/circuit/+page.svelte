<script lang="ts">
	import type { LayoutServerData } from '../../$types';
	import type { ActionData, PageServerData } from './$types';
	import {
		PublicationType,
		type Tag as PrismaTag
	} from '@prisma/client';
	import { page } from '$app/state';
	import { onDestroy, onMount } from 'svelte';
	import { type UserWithProfilePic } from '$lib/util/coursesLogic';
	import type {
		ParamsImmutable,
		ParamsMutable,
		ParamsMutableCircuit
	} from '$lib/util/frontendTypes.ts';
	import PublishWorkflow from '$lib/components/publication/publish/PublishWorkflow.svelte';
	import type { NodeInfo } from '$lib/components/circuits/methods/CircuitTypes.ts';


	export let form: ActionData;
	export let data: PageServerData & LayoutServerData;

	let fileComments: {
		added: Record<string, string>;
		deleted: Record<string, string>;
	} = { added: {}, deleted: {} };

	let showAnimation = false;

	let originalFiles: string[] = [];
	let originalFileNames: string[] = [];

	const supabaseURL: string = data.PUBLIC_SUPABASE_URL;
	let supabaseClient: any = page.data.supabase;
	let loggedUser = page.data.loggedUser;
	let isSubmitting: boolean = false;

	// tags
	let tags: string[] = data.pubView.publication.tags.map(t => t.content);
	$: tags = tags;
	let allTags: PrismaTag[] = data.tags;
	let newTags: string[] = [];

	let maintainers: UserWithProfilePic[] = data.pubView.publication.maintainers;

	let users: UserWithProfilePic[] = data.users;
	let searchableUsers = users.filter((u) => u.id !== loggedUser.id);
	// learning objectives
	let LOs: string[] = data.pubView.publication.learningObjectives;
	let PKs: string[] = data.pubView.publication.prerequisites;

	// input data
	let title: string = data.pubView.publication.title;
	let description: string = data.pubView.publication.description;


	onMount(() => {
		window.addEventListener('beforeunload', handleBeforeUnload);
		return () => {
			window.removeEventListener('beforeunload', handleBeforeUnload);
		};
	});


	$: uid = page.data.session?.user.id;

	let paramsMutable: ParamsMutable = {
		isSubmitting,
		title,
		loggedUser,
		searchableUsers,
		LOs,
		PKs,
		maintainers,
		tags,
		newTags,
		description,
		fileComments,
		globalComment: ""
	}

	let dataCircuit: ParamsMutableCircuit;

	$: dataCircuit = {
		circuitData: {numNodes: 0, add: [], delete: [], edit: [], next: []},
		coverPic: undefined,
		nodeInfo: data.pubView.publication.circuit?.nodes?.map(node => ({
			id: node.publication.id,
			title: node.publication.title,
			username: node.publication.publisher.username,
			isMaterial: node.publication.type === PublicationType.Material,
			next: node.next,
			posX: node.posX,
			posY: node.posY,
			extensions: node.extensions,
			publisherId: node.publication.publisherId
		})) as NodeInfo[] ?? []
	};


	let paramsImmutable: ParamsImmutable;
	$: paramsImmutable = {
		liked: [],
		saved: [],
		supabaseClient,
		supabaseURL,
		users,
		allCourses: [],
		uid,
		form,
		allTags
	}

	// export function changeFilezone(e: Event) {
	// 	const eventFiles = (e.target as HTMLInputElement).files;
	// 	if (eventFiles) {
	// 		files = concatFileList(files, eventFiles);
	// 	}
	// }

	const handleBeforeUnload = (event: BeforeUnloadEvent) => {
		const confirmation = confirm('Data will be lost. Are you sure you want to proceed?');

		if (!confirmation) {
			event.preventDefault();
			return;
		}
		showAnimation = false;
	};

	onDestroy(() => {
		showAnimation = false;
	});
</script>


<PublishWorkflow
	bind:data={paramsMutable}
	paramsImmutable={paramsImmutable}
	dataCircuit={dataCircuit}
	bind:showAnimation={showAnimation}
	edit={true}
	originalFiles={originalFiles}
	originalFileNames={originalFileNames}
	circuit={true}
/>

