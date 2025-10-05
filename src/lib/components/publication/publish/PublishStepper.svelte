<script lang="ts">
	import TitleStep from '$lib/components/publication/publish/TitleStep.svelte';
	import MetaInfoStep from '$lib/components/publication/publish/MetaInfoStep.svelte';
	import Preview from '$lib/components/publication/publish/Preview.svelte';
	import UploadFilesForm from '$lib/components/publication/UploadFilesForm.svelte';
	import { Step, Stepper } from '@skeletonlabs/skeleton';
	import type { FileTUSMetadata } from '$lib/util/indexDB.ts';
	import type { UserWithProfilePic } from '$lib/util/coursesLogic.ts';
	import type {  Tag as PrismaTag } from '@prisma/client';
	import type { CourseWithCoverPic } from '$lib/database/courses.ts';

	export let title: string = '';
	export let tags: string[] = [];
	export let description: string = '';
	export let estimate: number = 0;
	export let selectedType: string = 'Select type';
	export let coverPic: File | undefined = undefined;
	export let files: FileList = [] as unknown as FileList;
	export let fileURLs: string[] = [] as string[];
	export let fileTUSMetadata: { [key: string] : FileTUSMetadata } = {};
	export let fileTUSProgress: { [key: string]: any } = {};
	export let fileTUSUploadObjects: { [key: string]: any } = {};
	export let supabaseClient: any;
	export let loggedUser: UserWithProfilePic;
	export let maintainers: UserWithProfilePic[] = [];
	export let LOs: string[] = [];
	export let PKs: string[] = [];
	export let copyright: string = '';
	export let draft: boolean = false;
	export let markedAsDraft: boolean = false;
	export let searchableUsers: UserWithProfilePic[] = [];
	export let users: UserWithProfilePic[] = [];
	export let allTags: PrismaTag[] = [];
	export let newTags: string[] = [];
	export let showCourseProgressRadial: boolean = false;
	export let selectedTypes: string[] = [];
	export let originalCourseIds: number[] = [];
	export let courses: CourseWithCoverPic[];
	export let allCourses;
	export let course: number | null = null;

	export let isSubmitting: boolean = false;
	export let supabaseURL;

	const onNextHandler = () => {
		window.scrollTo({
			top: 0,
			behavior: 'smooth'
		});
	};
</script>

<Stepper on:submit={() => isSubmitting=true} buttonCompleteType="submit" on:step={onNextHandler}
		 buttonBackLabel="← Back"
		 buttonBack="btn text-surface-800 border border-surface-600 bg-surface-200 dark:text-surface-50 dark:bg-surface-600"
		 buttonNextLabel="Next →"
		 buttonNext="btn text-surface-50 bg-primary-600 dark:text-surface-50 dark:bg-primary-600"
		 buttonCompleteLabel="Complete"
		 buttonComplete="btn text-surface-50 bg-primary-600 dark:text-surface-50 dark:bg-primary-600">
	<Step>
		<svelte:fragment slot="header">Upload files<span class="text-error-300">*</span></svelte:fragment>
		<UploadFilesForm
			supabaseURL={supabaseURL}
			bind:supabaseClient={supabaseClient}
			bind:fileTUSMetadata={fileTUSMetadata}
			bind:fileTUSProgress={fileTUSProgress}
			bind:fileTUSUploadObjects={fileTUSUploadObjects}
			bind:fileURLs={fileURLs}
			bind:files={files}/>
	</Step>
	<Step>
		<svelte:fragment slot="header">Give your publication a title</svelte:fragment>
		<TitleStep bind:title={title}
				   bind:showCourseProgressRadial={showCourseProgressRadial}
				   bind:selectedTypes={selectedTypes}
				   bind:originalCourseIds={originalCourseIds}
				   bind:courses={courses}
				   bind:course={course}
				   bind:coverPic={coverPic}
				   bind:loggedUser={loggedUser}
				   bind:searchableUsers={searchableUsers}
				   allCourses={allCourses}
				   users={users}>
		</TitleStep>
	</Step>
	<Step>
		<svelte:fragment slot="header">Fill in meta information</svelte:fragment>
		<MetaInfoStep bind:estimate={estimate}
					  bind:copyright={copyright}
					  bind:LOs={LOs}
					  bind:PKs={PKs}
					  bind:maintainers={maintainers}
					  bind:loggedUser={loggedUser}
					  bind:searchableUsers={searchableUsers}
					  users={users}
					  allTags={allTags}
					  bind:tags={tags}
					  bind:newTags={newTags}
					  bind:description={description}/>
	</Step>
	<Step locked={isSubmitting}>
		<svelte:fragment slot="header">Review</svelte:fragment>
		<Preview
			title={title}
			tags={tags}
			description={description}
			estimate={estimate}
			selectedType={selectedType}
			coverPic={coverPic}
			files={files}
			fileURLs={fileURLs}
			fileTUSMetadata={fileTUSMetadata}
			fileTUSProgress={fileTUSProgress}
			fileTUSUploadObjects={fileTUSUploadObjects}
			loggedUser={loggedUser}
			maintainers={maintainers}
			LOs={LOs}
			PKs={PKs}
			copyright={copyright}
			draft={draft}
			markedAsDraft={markedAsDraft}
			supabaseClient={supabaseClient}
		/>

	</Step>
</Stepper>