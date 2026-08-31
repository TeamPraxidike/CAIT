<script lang="ts">
	import TitleStep from '$lib/components/publication/publish/TitleStep.svelte';
	import MetaInfoStep from '$lib/components/publication/publish/MetaInfoStep.svelte';
	import Preview from '$lib/components/publication/publish/Preview.svelte';
	import UploadFilesForm from '$lib/components/publication/UploadFilesForm.svelte';
	import { Step, Stepper } from '@skeletonlabs/skeleton';
	import { changeCourse } from '$lib/util/coursesLogic.ts';
	import { downloadFileFromSupabase } from '$lib/util/file.ts';
	import type { ParamsImmutable, ParamsMutable, ParamsMutableMaterial } from '$lib/util/frontendTypes.ts';

	export let data: ParamsMutable;
	export let dataMaterial: ParamsMutableMaterial | null;
	export let paramsImmutable: ParamsImmutable;

	export let draft: boolean;
	export let markedAsDraft: boolean;
	export let edit: boolean;
	export let circuit: boolean = false;
	export let originalFileIds: string[] = [];


	const onNextHandler = () => {
		window.scrollTo({
			top: 0,
			behavior: 'smooth'
		});
	};

	// Do not reapply course defaults when opening an existing publication.
	// They should only be applied after the user explicitly changes the course.
	let previousCourse: number | null = dataMaterial?.course ?? null;
	$: if (dataMaterial && dataMaterial.course !== previousCourse) {
		const currentCourse = dataMaterial.courses.find(c => c.id === dataMaterial?.course);
		data.maintainers = [];
		const prev_temp = previousCourse;
		previousCourse = dataMaterial.course;
		const result = changeCourse(dataMaterial.course, prev_temp, data.LOs, data.PKs, dataMaterial.courses, data.maintainers);
		dataMaterial.course = result.course;
		data.LOs = result.LOs;
		data.PKs = result.PKs;
		data.maintainers = result.maintainers;

		if (currentCourse) {
			if (currentCourse.copyright !== "") {
				dataMaterial.copyright = currentCourse.copyright;
			}
			if (currentCourse?.coverPic?.data) {
				downloadFileFromSupabase(paramsImmutable.supabaseClient, currentCourse.coverPic).then(f => {
					dataMaterial ? dataMaterial.coverPic = f || undefined : undefined;
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
		<svelte:fragment slot="header">{circuit ? "Create circuit" : "Upload files"}<span class="text-error-300">*</span></svelte:fragment>
		{#if !circuit && dataMaterial}
			<UploadFilesForm
				supabaseURL={paramsImmutable.supabaseURL}
				isEditContext={edit}
				bind:supabaseClient={paramsImmutable.supabaseClient}
				bind:fileTUSMetadata={dataMaterial.fileTUSMetadata}
				bind:fileTUSProgress={dataMaterial.fileTUSProgress}
				bind:fileTUSUploadObjects={dataMaterial.fileTUSUploadObjects}
				bind:fileURLs={dataMaterial.fileURLs}
				bind:files={dataMaterial.files}
				originalFileIds={originalFileIds}
				bind:fileChangeComments={data.fileComments}
			/>
		{/if}
	</Step>
	<Step>
		<svelte:fragment slot="header">Give your publication a title</svelte:fragment>
		{#if !circuit && dataMaterial}
			<TitleStep bind:data={data}
					   bind:dataMaterial={dataMaterial}
					   paramsImmutable={paramsImmutable}
					   isEditContext={edit}
			/>
		{/if}
	</Step>
	<Step>
		<svelte:fragment slot="header">Fill in meta information</svelte:fragment>
		<MetaInfoStep bind:data={data}
					  bind:dataMaterial={dataMaterial}
					  paramsImmutable={paramsImmutable}/>
	</Step>
	<Step locked={data.isSubmitting}>
		<svelte:fragment slot="header">Review</svelte:fragment>
		<Preview
			bind:data={data}
			bind:dataMaterial={dataMaterial}
			paramsImmutable={paramsImmutable}
			bind:draft={draft}
			bind:markedAsDraft={markedAsDraft}
			isCircuit={circuit}
		/>
	</Step>
</Stepper>
