<script lang="ts">
	import PublishStepper from '$lib/components/publication/publish/PublishStepper.svelte';
	import PublishConfirmation from '$lib/components/publication/publish/PublishConfirmation.svelte';
	import { Meta } from '$lib';
	import Banner from '$lib/components/publication/Banner.svelte';
	import { fade } from 'svelte/transition';
	import { isMaterialDraft } from '$lib/util/validatePublication.ts';
	import { enhance } from '$app/forms';
	import { allUploadsDone } from '$lib/util/file';
	import { getToastStore, ProgressRadial } from '@skeletonlabs/skeleton';
	import type {
		ParamsImmutable,
		ParamsMutable,
		ParamsMutableCircuit,
		ParamsMutableMaterial
	} from '$lib/util/frontendTypes.ts';
	import { tick } from 'svelte';
	import { clearAllData } from '$lib/util/indexDB.ts';
	import PublishStepperCircuit from '$lib/components/publication/PublishStepperCircuit.svelte';


	export let data: ParamsMutable;
	export let dataMaterial: ParamsMutableMaterial | null;
	export let dataCircuit: ParamsMutableCircuit | null;
	export let paramsImmutable: ParamsImmutable;

	export let showAnimation: boolean;

	export let materialId: number | undefined = undefined;
	export let edit: boolean = false;
	export let circuit: boolean = false;


	// Editing mode needs to know what the original files were, so that it can delete only the ones that were removed
	// Here we pass the path of the file
	export let originalFiles: any[] = [];

	export let saveInterval: number | undefined = undefined;
	const toastStore = getToastStore();
	$: if (showAnimation) {
		// tick() waits until the DOM has been updated
		tick().then(() => {
			window.scrollTo({ top: 0, behavior: 'smooth' });
		});
	}

	// IMPORTANT - use contexts to separate form events
	// otherwise, for example, any Course related form events get mistaken for
	// events from the main form
	$: if (paramsImmutable.form?.status === 200 && paramsImmutable.form?.context === 'publication-form') {
		if (edit){
			showAnimation = true;
		}

		// indexDB is active only during upload
		else {
			if (saveInterval) {
				window.clearInterval(saveInterval);
			}

			Promise.all([
				clearAllData()
			]).then(async () => {
				showAnimation = true;
			}).catch(error => {
				console.error('Error clearing data:', error);
			});
		}

	} else if (dataMaterial && paramsImmutable.form?.status === 400 && paramsImmutable.form?.context === 'publication-form') {
		console.log('Form submission failed with status 400:');
		if (!allUploadsDone(dataMaterial.fileTUSMetadata, dataMaterial.files)){
			toastStore.trigger({
				message: 'Some files are still being uploaded',
				background: 'bg-warning-200'
			});
		}
		else {
			toastStore.trigger({
				message: `Malformed information, please check your inputs: ${paramsImmutable.form?.message}`,
				background: 'bg-warning-200',
				classes: 'text-surface-900'
			});
		}

		data.isSubmitting = false;
	} else if (paramsImmutable.form?.status === 418) {
		console.log("error 418 ");
		data.isSubmitting = false;
		showAnimation = false;
	} else if (paramsImmutable.form?.status === 500 && paramsImmutable.form?.context === 'publication-form') {
		console.log('Form submission failed with status 500:');
		toastStore.trigger({
			message: 'An error occurred, please try again later or contact support',
			background: 'bg-error-200',
			classes: 'text-surface-900'
		});
		data.isSubmitting = false;
	} else if (dataMaterial && paramsImmutable.form?.status == 200 && paramsImmutable.form?.context === 'course-form') {
		const updated = paramsImmutable.form.course;
		const idx = dataMaterial.courses.findIndex(c => c.id === updated.id);

		dataMaterial.showCourseProgressRadial = false;

		if (idx !== -1) {
			dataMaterial.courses[idx] = updated;
			dataMaterial.courses = [...dataMaterial.courses];
		} else {
			dataMaterial.originalCourseIds = [...dataMaterial.originalCourseIds, updated.id];
			dataMaterial.courses.push(updated);
			dataMaterial.courses = dataMaterial.courses;
		}
		paramsImmutable.form = { ...paramsImmutable.form, context: "undefined" };
	}

	let markedAsDraft = false;
	let draft = true;
	$: metadata = {
		title: data.title,
		description: data.description,
		learningObjectives: data.LOs,
		tags: data.tags,
		materialType: dataMaterial?.selectedTypes,
		isDraft: false
	};
	$: numMaterials = (dataMaterial?.fileURLs || []).length + (dataMaterial?.files || []).length;
	$: draft = isMaterialDraft(metadata, numMaterials);

	let bannerFieldsList: string[] = [];
	// TODO: cool but it's not working as expected, I've removed one condition
	// The selected type of the material is autofilled to 'Other' if none is selected but is still displayed in the banner to
	// incentivize the user to fill it in. This is why here we have to check whether it is the only thing that is missing
	// because if it the publication should not be a draft
	$: showDraftMessage = (bannerFieldsList.length >= 1 || markedAsDraft);
</script>
<Meta title="Publish" description="CAIT" type="site" />

{#if !showAnimation}
	<div class="col-span-full" out:fade={{duration: 400}}>
		<Banner bind:fieldsList={bannerFieldsList} metadata={metadata} files={numMaterials} materialType={metadata.materialType}/>
	</div>

	<div class="form-container col-span-full px-5 pt-5 pb-5 shadow"
		 out:fade={{duration: 400}}>
		<form method="POST"
			  enctype="multipart/form-data"
			  action={edit ? "?/edit" : "?/publish"}
			  use:enhance={({ formData }) => {

				  	if (!circuit && dataMaterial) {
					  	// apparently files are automatically appended to the form using the
						// file key, so just remove it
						formData.delete('file')
						data.isSubmitting = true;

						// check if all the file uploads (excluding cover picture) are done
						if (!(allUploadsDone(dataMaterial.fileTUSMetadata, dataMaterial.files))){
							// alert('Some files are still being uploaded');
							data.isSubmitting = false;
							return;
						}

						for (const f of dataMaterial.files){
							let uploadFormat = {
								title: f.name,
								type: f.type,
								info: dataMaterial.fileTUSMetadata[f.name]['generatedName']
							}
							formData.append('file', JSON.stringify(uploadFormat));
						}

						for (const url of dataMaterial.fileURLs){
							let uploadFormat = {
								title: url,
								type: "URL",
								info: url
							}
							formData.append('fileURLs', JSON.stringify(uploadFormat));
						}

						formData.append('type', JSON.stringify(dataMaterial.selectedTypes));
						formData.append('estimate', JSON.stringify(dataMaterial.estimate));
						formData.append('copyright', dataMaterial.copyright);
						formData.append('coverPic', dataMaterial.coverPic || '');
						formData.append('course', dataMaterial.course ? dataMaterial.course.toString() : 'null');
					} else if (dataCircuit) {
						data.isSubmitting = true;
						formData.append('circuitData', JSON.stringify(dataCircuit.circuitData));
						formData.append('coverPic', JSON.stringify(dataCircuit.coverPic) || '');
					}

					formData.append('userId', paramsImmutable.uid?.toString() || '');
					formData.append('title', data.title);
					formData.append('description', data.description);
					formData.append('tags', JSON.stringify(data.tags));
					formData.append('maintainers', JSON.stringify(data.maintainers.map(m => m.id)));
					formData.append('learningObjectives', JSON.stringify(data.LOs));
					formData.append('prerequisites', JSON.stringify(data.PKs));
					formData.append('newTags', JSON.stringify(data.newTags));
					formData.append('isDraft', JSON.stringify(markedAsDraft || draft));

					if (edit) {
						formData.append('oldFilesData', JSON.stringify(originalFiles));
						formData.append('materialId', materialId?.toString() || '');
					}
			  }}>

			{#if !circuit}
				<PublishStepper
					bind:data={data}
					bind:dataMaterial={dataMaterial}
					paramsImmutable={paramsImmutable}
					edit={edit}
					bind:draft={draft}
					bind:markedAsDraft={markedAsDraft}
					circuit={circuit}
				/>
			{:else}
				<PublishStepperCircuit
					bind:data={data}
					bind:dataCircuit={dataCircuit}
					paramsImmutable={paramsImmutable}
					bind:draft={draft}
					bind:markedAsDraft={markedAsDraft}
				/>
			{/if}

		</form>

		<!-- Loading Radial -->
		<!-- this is not a really good solution...	-->
		{#if data.isSubmitting}
			<div class="col-span-full relative w-full">
				<div class="absolute right-0 -top-[50px] z-10 bg-white pr-8 pl-20 py-3">
					<ProgressRadial font={12} width="w-10"/>
				</div>
			</div>
		{/if}
	</div>

{:else}
	<!--	paramsImmutable.form?.id is the publicationId	-->
	<PublishConfirmation
		bind:showDraftMessage={showDraftMessage}
		username={data.loggedUser.username}
		formId={paramsImmutable.form?.id}
		edit={edit}
	/>
{/if}

<style>
    .form-container {
        position: relative;
    }
</style>