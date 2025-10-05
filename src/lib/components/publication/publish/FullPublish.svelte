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
	import type { ParamsImmutable, ParamsMutable, PublishParams } from '$lib/util/frontendTypes.ts';
	import { tick } from 'svelte';
	import { clearAllData } from '$lib/util/indexDB.ts';
	import type { ActionData } from '../../../../../.svelte-kit/types/src/routes/publish/materials/$types';


	export let data: ParamsMutable;
	export let paramsImmutable: ParamsImmutable;
	export let form: ActionData;

	export let saveInterval: number | undefined = undefined;

	const toastStore = getToastStore();
	let showAnimation = false;
	$: if (showAnimation) {
		// tick() waits until the DOM has been updated
		tick().then(() => {
			window.scrollTo({ top: 0, behavior: 'smooth' });
		});
	}

	// IMPORTANT - use contexts to separate form events
	// otherwise, for example, any Course related form events get mistaken for
	// events from the main form
	$: if (form?.status === 200 && form?.context === 'publication-form') {
		console.log('Form submission successful:');
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
	} else if (form?.status === 400 && form?.context === 'publication-form') {
		console.log('Form submission failed with status 400:');
		if (!allUploadsDone(data.fileTUSMetadata, data.files)){
			toastStore.trigger({
				message: 'Some files are still being uploaded',
				background: 'bg-warning-200'
			});
		}
		else {
			toastStore.trigger({
				message: `Malformed information, please check your inputs: ${form?.message}`,
				background: 'bg-warning-200',
				classes: 'text-surface-900'
			});
		}

		data.isSubmitting = false;
	} else if (form?.status === 418) {
		console.log("error 418 ");
		isSubmitting = false;
		showAnimation = false;
	} else if (form?.status === 500 && form?.context === 'publication-form') {
		console.log('Form submission failed with status 500:');
		toastStore.trigger({
			message: 'An error occurred, please try again later or contact support',
			background: 'bg-error-200',
			classes: 'text-surface-900'
		});
		data.isSubmitting = false;
	} else if (form?.status == 200 && form?.context === 'course-form') {
		const updated = form.course;
		const idx = data.courses.findIndex(c => c.id === updated.id);

		data.showCourseProgressRadial = false;

		if (idx !== -1) {
			data.courses[idx] = updated;
			data.courses = [...data.courses];
		} else {
			data.originalCourseIds = [...data.originalCourseIds, updated.id];
			data.courses.push(updated);
			data.courses = data.courses;
		}
		form = { ...form, context: "undefined" };
	}

	let markedAsDraft = false;
	let draft = true;
	$: metadata = {
		title: data.title,
		description: data.description,
		learningObjectives: data.LOs,
		tags: data.tags,
		materialType: data.selectedTypes,
		isDraft: false
	};
	$: numMaterials = data.fileURLs.length + data.files.length;
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
			  action="?/publish"
			  use:enhance={({ formData }) => {
					// apparently files are automatically appended to the form using the
					// file key, so just remove it
					formData.delete('file')
					data.isSubmitting = true;
					let willSubmit = true;

					// check if all the file uploads (excluding cover picture) are done
					if (!(allUploadsDone(data.fileTUSMetadata, data.files))){
						// alert('Some files are still being uploaded');
						data.isSubmitting = false;
						return;
					}

					for (const f of data.files){
						let uploadFormat = {
							title: f.name,
							type: f.type,
							info: data.fileTUSMetadata[f.name]['generatedName']
						}
						formData.append('file', JSON.stringify(uploadFormat));
					}

					for (const url of data.fileURLs){
						let uploadFormat = {
							title: url,
							type: "URL",
							info: url
						}
						formData.append('fileURLs', JSON.stringify(uploadFormat));
					}

					formData.append('userId', data.loggedUser.uid?.toString() || '');
					formData.append('title', data.title);
					formData.append('description', data.description);
					formData.append('type', JSON.stringify(data.selectedTypes));
					formData.append('estimate', JSON.stringify(data.estimate));
					formData.append('copyright', data.copyright);
					formData.append('tags', JSON.stringify(data.tags));
					formData.append('maintainers', JSON.stringify(data.maintainers.map(m => m.id)));
					formData.append('learningObjectives', JSON.stringify(data.LOs));
					formData.append('prerequisites', JSON.stringify(data.PKs));
					formData.append('coverPic', data.coverPic || '');
					formData.append('newTags', JSON.stringify(data.newTags));
					formData.append('isDraft', JSON.stringify(markedAsDraft || draft));
					formData.append('course', data.course ? data.course.toString() : 'null');
			  }}>
			<PublishStepper
				bind:data={data}
				paramsImmutable={paramsImmutable}
				draft={draft}
				markedAsDraft={markedAsDraft}
			/>

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
	<PublishConfirmation
		bind:showDraftMessage={showDraftMessage}
		username={data.loggedUser.username}
		formId={form?.id}
	/>
{/if}

<style>
    .form-container {
        position: relative;
    }
</style>