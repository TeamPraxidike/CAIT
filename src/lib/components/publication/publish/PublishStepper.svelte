<script lang="ts">
	import TitleStep from '$lib/components/publication/publish/TitleStep.svelte';
	import MetaInfoStep from '$lib/components/publication/publish/MetaInfoStep.svelte';
	import Preview from '$lib/components/publication/publish/Preview.svelte';
	import UploadFilesForm from '$lib/components/publication/UploadFilesForm.svelte';
	import { Step, Stepper } from '@skeletonlabs/skeleton';
	import { changeCourse } from '$lib/util/coursesLogic.ts';
	import { downloadFileFromSupabase } from '$lib/util/file.ts';
	import type { ParamsImmutable, ParamsMutable } from '$lib/util/frontendTypes.ts';

	export let data: ParamsMutable;
	export let paramsImmutable: ParamsImmutable;

	export let draft: boolean;
	export let markedAsDraft: boolean;
	export let edit: boolean;
	export let originalFileIds: string[] = [];


	const onNextHandler = () => {
		window.scrollTo({
			top: 0,
			behavior: 'smooth'
		});
	};

	let previousCourse: number | null = null;
	$: if (data.course !== previousCourse) {
		const currentCourse = data.courses.find(c => c.id === data.course);
		data.maintainers = [];
		const prev_temp = previousCourse;
		previousCourse = data.course;
		const result = changeCourse(data.course, prev_temp, data.LOs, data.PKs, data.courses, data.maintainers);
		data.course = result.course;
		data.LOs = result.LOs;
		data.PKs = result.PKs;
		data.maintainers = result.maintainers;

		if (currentCourse) {
			if (currentCourse.copyright !== "") {
				data.copyright = currentCourse.copyright;
			}
			if (currentCourse?.coverPic?.data) {
				downloadFileFromSupabase(paramsImmutable.supabaseClient, currentCourse.coverPic).then(f => {
					data.coverPic = f || undefined;
				});
			}
		}
	}
</script>

<Stepper on:submit={() => data.isSubmitting=true} buttonCompleteType="submit" on:step={onNextHandler}
		 buttonBackLabel="← Back"
		 buttonBack="btn text-surface-800 border border-surface-600 bg-surface-200 dark:text-surface-50 dark:bg-surface-600"
		 buttonNextLabel="Next →"
		 buttonNext="btn text-surface-50 bg-primary-600 dark:text-surface-50 dark:bg-primary-600"
		 buttonCompleteLabel="Complete"
		 buttonComplete="btn text-surface-50 bg-primary-600 dark:text-surface-50 dark:bg-primary-600">
	<Step>
		<svelte:fragment slot="header">Upload files<span class="text-error-300">*</span></svelte:fragment>
		<UploadFilesForm
			supabaseURL={paramsImmutable.supabaseURL}
			isEditContext={edit}
			originalFileIds={originalFileIds}
			bind:supabaseClient={paramsImmutable.supabaseClient}
			bind:fileTUSMetadata={data.fileTUSMetadata}
			bind:fileTUSProgress={data.fileTUSProgress}
			bind:fileTUSUploadObjects={data.fileTUSUploadObjects}
			bind:fileURLs={data.fileURLs}
			bind:files={data.files}
			bind:fileChangeComments={data.fileComments}/>
	</Step>
	<Step>
		<svelte:fragment slot="header">Give your publication a title</svelte:fragment>
		<TitleStep bind:data={data}
				   paramsImmutable={paramsImmutable}
		/>
	</Step>
	<Step>
		<svelte:fragment slot="header">Fill in meta information</svelte:fragment>
		<MetaInfoStep bind:data={data}
					  paramsImmutable={paramsImmutable}/>
	</Step>
	<Step locked={data.isSubmitting}>
		<svelte:fragment slot="header">Review</svelte:fragment>
		<Preview
			bind:data={data}
			paramsImmutable={paramsImmutable}
			bind:draft={draft}
			bind:markedAsDraft={markedAsDraft}
		/>

	</Step>
</Stepper>
