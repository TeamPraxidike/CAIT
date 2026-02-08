<script lang="ts">
	import SelectType from '$lib/components/publication/SelectType.svelte';
	import { getToastStore, ProgressRadial } from '@skeletonlabs/skeleton';
	import SelectCourse from '$lib/components/publication/SelectCourse.svelte';
	import CoverPicSelect from '$lib/components/publication/CoverPicSelect.svelte';
	import type { CourseWithCoverPic } from '$lib/database/courses.ts';
	import { tick } from 'svelte';
	import type { UserWithProfilePic } from '$lib/util/coursesLogic.ts';
	import CourseModal from '$lib/components/publication/CourseModal.svelte';
	import type { ParamsImmutable, ParamsMutable, ParamsMutableMaterial } from '$lib/util/frontendTypes.ts';

	export let data: ParamsMutable;
	export let dataMaterial: ParamsMutableMaterial;
	export let paramsImmutable: ParamsImmutable;

	const toastStore = getToastStore();
	let editingCourse: CourseWithCoverPic | null = null;
	let showModal = false;
	let courseMaintainers: UserWithProfilePic[] = [];


	function openModal(courseToEdit: CourseWithCoverPic | null = null) {
		if (courseToEdit) {
			editingCourse = courseToEdit;
			// prefill maintainers for edit (exclude current user)
			courseMaintainers = (courseToEdit.maintainers || []).filter((m: any) => m.id !== data.loggedUser.id);
		} else {
			editingCourse = null;
			courseMaintainers = [];
		}
		tick().then(() => {
			window.scrollTo({ top: 0, behavior: 'smooth' });
		});

		showModal = true;
	}

	function closeModal() {
		showModal = false;
	}

	const handleInputEnter = (event: KeyboardEvent) => {
		if (event.key === 'Enter') {
			event.preventDefault();
		}
	};
</script>

<div class="grid grid-cols-2 gap-x-4 gap-y-2">
	<label for="title" class="block font-medium">Title<span class="text-error-300">*</span></label>
	<label for="coverPic" class="block font-medium">Cover Picture (Max. size: 2MB)</label>

	<div class="flex flex-col gap-2 mb-5">
		<input type="text" name="title" placeholder="Title" bind:value={data.title} on:keydown={handleInputEnter}
			   class="rounded-lg dark:bg-surface-800 bg-surface-50 w-full text-surface-700 dark:text-surface-400 focus:border-primary-500 focus:ring-0">
		<div class="flex flex-col gap-1">
			<label for="content" class="mt-1 block font-medium">Content<span class="text-error-300">*</span></label>
			<SelectType bind:selectedTypes={dataMaterial.selectedTypes}/>
			<hr class="my-3 mx-2">
			<div class="flex items-center gap-2 h-[32px] mb-2">
				<label for="course" class="font-medium flex items-center">
					Course<span class="text-error-300">*</span>
				</label>
				{#if dataMaterial.showCourseProgressRadial}
					<ProgressRadial font={8} width="w-8" class="shrink-0" />
				{/if}
			</div>
			<SelectCourse on:showCourseModal={() => openModal(null)}
						  bind:selectedCourseId={dataMaterial.course}
						  courses={dataMaterial.courses}
						  allCourses={paramsImmutable.allCourses}
						  bind:originalCourseIds={dataMaterial.originalCourseIds}
						  on:courseEditRequest={(event) => {
									openModal(event.detail.course);
								  }}
						  on:courseDeleted={(event) => {
									  dataMaterial.courses = dataMaterial.courses.filter(c => c.id !== event.detail.courseId);
									  dataMaterial.courses = [...dataMaterial.courses];
								  }}
						  on:deselectCourse={() => {
									  dataMaterial.coverPic = undefined;
								  }}
			/>
		</div>
	</div>
	<CoverPicSelect bind:coverPic={dataMaterial.coverPic} toastStore={toastStore} />
</div>


{#if showModal}
	<CourseModal existingCourse={editingCourse} close={closeModal} publisher={data.loggedUser} bind:searchableUsers={data.searchableUsers} users={paramsImmutable.users}
				 bind:showCourseProgressRadial={dataMaterial.showCourseProgressRadial}
				 bind:additionalMaintainers={courseMaintainers}
				 on:courseDeleted={(event) => {
					const id = event.detail.courseId;
					dataMaterial.courses = dataMaterial.courses.filter(c => c.id !== id);
					dataMaterial.originalCourseIds = dataMaterial.originalCourseIds.filter(x => x !== id);
					if (dataMaterial.course === id) dataMaterial.course = null;
				}}
				 on:courseCreated={(event) => {
					 dataMaterial.courses = [...dataMaterial.courses, event.detail.course];
					 dataMaterial.originalCourseIds = [...dataMaterial.originalCourseIds, event.detail.course.id];
				 }}
	/>
{/if}