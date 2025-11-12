<script lang="ts">
	import type { LayoutServerData } from '../../$types';
	import type { ActionData, PageServerData } from './$types';
	import {
		type Tag as PrismaTag
	} from '@prisma/client';
	import {
		arrayToFileList,
		base64ToFile,
		concatFileList,
		createFileList,
		downloadFileFromSupabase
	} from '$lib/util/file';
	import { page } from '$app/state';
	import { onDestroy, onMount } from 'svelte';
	import {
		type FileTUSMetadata,
	} from '$lib/util/indexDB';
	import { type UserWithProfilePic } from '$lib/util/coursesLogic';
	import type { ParamsImmutable, ParamsMutable } from '$lib/util/frontendTypes.ts';
	import PublishWorkflow from '$lib/components/publication/publish/PublishWorkflow.svelte';


	export let form: ActionData;
	export let data: PageServerData & LayoutServerData;

	let showAnimation = false;

	let originalFiles: string[] = [];

	const supabaseURL: string = data.PUBLIC_SUPABASE_URL;
	let supabaseClient: any = page.data.supabase;
	let loggedUser = page.data.loggedUser;
	let isSubmitting: boolean = false;

	const materialId: number = data.pubView.publication.materials.id;

	// tags
	let tags: string[] = data.pubView.publication.tags.map(t => t.content);
	$: tags = tags;
	let allTags: PrismaTag[] = data.tags;
	let newTags: string[] = [];

	let files: FileList = [] as unknown as FileList;
	let fileURLs: string[] = data.pubView.publication.materials.fileURLs.map(x => x.url);
	let maintainers: UserWithProfilePic[] = data.pubView.publication.maintainers;
	let courses = data.courses;
	$: courses = courses;

	let originalCourseIds: number[] = courses.map(c => c.id);

	let users: UserWithProfilePic[] = data.users;
	let searchableUsers = users.filter((u) => u.id !== loggedUser.id);
	// learning objectives
	let LOs: string[] = data.pubView.publication.learningObjectives;
	let PKs: string[] = data.pubView.publication.prerequisites;

	// input data
	let title: string = data.pubView.publication.title;
	let description: string = data.pubView.publication.description;
	let course: number | null = data.pubView.publication.course?.id || null;
	let estimate: number = data.pubView.publication.materials.timeEstimate || 0;
	let copyright: string = data.pubView.publication.materials.copyright;
	let selectedTypes: string[] = [];

	// TODO: do I absolutely need these for reactivity?
	// also, this whole system could be redesigned with event emitters
	// rather than binding values
	let fileTUSMetadata: { [key: string] : FileTUSMetadata } = {};
	$: fileTUSMetadata = fileTUSMetadata;
	let fileTUSProgress: { [key: string]: any } = {};
	$: fileTUSProgress = fileTUSProgress
	let fileTUSUploadObjects: { [key: string]: any } = {};
	$: fileTUSUploadObjects = fileTUSUploadObjects


	let filesReady = false;
	onMount(() => {
		window.addEventListener('beforeunload', handleBeforeUnload);

		(async () => {
			const fetched = await data.fetchedFiles;
			const downloaded = fetched
				? await Promise.all(fetched.map((f) => downloadFileFromSupabase(supabaseClient, f)))
				: [];
			const fileArray: File[] = downloaded.filter((f): f is File => f instanceof File);
			files = arrayToFileList(fileArray);

			// I dont like that, but the check for upload completion depends on this metadata
			// I add it here and I say that all files are already uploaded, but I dont know how to access the generatedName so I just put the normal one there
			// Hopefully this wont cause issues
			for (const f of files){
				fileTUSMetadata[f.name] = {
					originalName: f.name,
					isDone: true,
					generatedName: f.name
				}
			}
			filesReady = true;
			originalFiles = Array.from(files).map(f => f.name);
		})();

		return () => {
			window.removeEventListener('beforeunload', handleBeforeUnload);
		};
	});

	// cover
	let coverPic: File | undefined = undefined;
	$: uid = page.data.session?.user.id;
	let showCourseProgressRadial = false;

	let paramsMutable: ParamsMutable = {
		isSubmitting,
		fileTUSMetadata,
		fileTUSProgress,
		fileTUSUploadObjects,
		fileURLs,
		files,
		title,
		showCourseProgressRadial,
		selectedTypes,
		originalCourseIds,
		courses,
		course,
		coverPic,
		loggedUser,
		searchableUsers,
		estimate,
		copyright,
		LOs,
		PKs,
		maintainers,
		tags,
		newTags,
		description
	}

	let paramsImmutable: ParamsImmutable;
	$: paramsImmutable = {
		supabaseClient,
		supabaseURL,
		users,
		allCourses: data.allCourses,
		uid,
		form,
		allTags
	}

	let initializedFromFetch = false;

	// We need the initializedfromFetch variable because otherwise the statement runs every time files.length changes,
	// overwriting any files added (or removed) by the user after the initial fetch
	$: if (!initializedFromFetch && filesReady && files.length > 0) {
		paramsMutable.files = files;

		// ensure missing metadata just for the initially fetched files
		for (const f of Array.from(paramsMutable.files)) {
			if (!fileTUSMetadata[f.name]) {
				fileTUSMetadata[f.name] = {
					originalName: f.name,
					isDone: true,
					generatedName: f.name
				};
			}
		}
		paramsMutable.fileTUSMetadata = fileTUSMetadata;

		paramsMutable = { ...paramsMutable };

		initializedFromFetch = true;
	}

	export function changeFilezone(e: Event) {
		const eventFiles = (e.target as HTMLInputElement).files;
		if (eventFiles) {
			files = concatFileList(files, eventFiles);
		}
	}

	const handleBeforeUnload = (event: BeforeUnloadEvent) => {
		const confirmation = confirm('Data will be lost. Are you sure you want to proceed?');

		if (!confirmation) {
			event.preventDefault();
			return;
		}
		showAnimation = false;
	};

	onMount(() => {
		(async () => {
			window.addEventListener('beforeunload', handleBeforeUnload);

			return () => {
				window.removeEventListener('beforeunload', handleBeforeUnload);
			};
		})();
	});

	onDestroy(() => {
		showAnimation = false;
	});
</script>

<PublishWorkflow bind:data={paramsMutable}
				 paramsImmutable={paramsImmutable}
				 bind:showAnimation={showAnimation}
				 edit={true}
				 originalFiles={originalFiles}
				 materialId={materialId}/>