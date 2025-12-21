<script lang="ts">
	import type { LayoutServerData } from '../../$types';
	import type { ActionData, PageServerData } from './$types';
	import { fade } from 'svelte/transition';
	import {
		type Tag as PrismaTag
	} from '@prisma/client';
	import {
		arrayToFileList,
		concatFileList,
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
	import type {FetchedFileArray} from "$lib/database";
	import {ProgressRadial} from "@skeletonlabs/skeleton";


	export let form: ActionData;
	export let data: PageServerData & LayoutServerData;

	let fileComments: Record<string, string> = {};

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

	let files: FileList | Promise<FileList> = new Promise(() => {});
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
	let selectedTypes: string[] = [data.pubView.publication.materials.encapsulatingType];

	let loadingFiles: boolean = false;

	// TODO: do I absolutely need these for reactivity?
	// also, this whole system could be redesigned with event emitters
	// rather than binding values
	let fileTUSMetadata: { [key: string] : FileTUSMetadata } = {};
	$: fileTUSMetadata = fileTUSMetadata;
	let fileTUSProgress: { [key: string]: any } = {};
	$: fileTUSProgress = fileTUSProgress
	let fileTUSUploadObjects: { [key: string]: any } = {};
	$: fileTUSUploadObjects = fileTUSUploadObjects

	async function loadFiles(filesToLoad): Promise<FileList>{
		const fetched: FetchedFileArray = await filesToLoad;
		const downloaded = fetched
				? await Promise.all(fetched.map((f) => downloadFileFromSupabase(supabaseClient, f)))
				: [];
		const fileArray: File[] = downloaded.filter((f): f is File => f instanceof File);
		return {
			fileList: arrayToFileList(fileArray),
			fetched: fetched
		};
	}

	// TODO: possibly move the file loading to a function which returns a promise
	onMount(() => {
		window.addEventListener('beforeunload', handleBeforeUnload);

		(async () => {
			loadingFiles = true;

			files = loadFiles(data.fetchedFiles).then((resolved) => {
				for (const f of resolved.fetched){
					fileTUSMetadata[f.name] = {
						originalName: f.name,
						isDone: true,
						generatedName: f.fileId
					}
				}
				originalFiles = Array.from(resolved.fetched).map(f => f.fileId);

				paramsMutable = {
					...paramsMutable,
					files: resolved.fileList,
					fileTUSMetadata: fileTUSMetadata
				};

				return resolved.fileList;
			}).finally(() => {
				loadingFiles = false;
			});
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
		description,
		fileComments,
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

	onDestroy(() => {
		showAnimation = false;
	});
</script>

{#if loadingFiles}
	<div in:fade={{ duration: 100, delay: 200 }} class="flex flex-row items-center justify-center gap-2 col-span-full pt-20">
		<p>Loading content</p>
		<ProgressRadial font={8} width="w-8" class="shrink-0" />
	</div>
{/if}

{#await files then _}
	<PublishWorkflow
		bind:data={paramsMutable}
		paramsImmutable={paramsImmutable}
		bind:showAnimation={showAnimation}
		edit={true}
		originalFiles={originalFiles}
		materialId={materialId}/>
{:catch error}
	<p class="flex items-center justify-center col-span-full pt-20">Could not load the files: "{error.message}". Please refresh the page.</p>
{/await}