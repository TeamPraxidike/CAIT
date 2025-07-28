<script lang="ts">
	import type { Course } from '$lib/database/courses';
	import CourseModal from '$lib/components/publication/CourseModal.svelte';
	import { invalidate } from '$app/navigation';
	import { goto } from '$app/navigation';
	import { getModalStore, type ModalSettings } from '@skeletonlabs/skeleton';
	import { createEventDispatcher } from 'svelte';
	import Icon from '@iconify/svelte';
	import BrowseCourses from '$lib/components/publication/courses/BrowseCourses.svelte';
	import CourseButton from '$lib/components/publication/courses/CourseButton.svelte';
	const dispatch = createEventDispatcher();



	const modalStore = getModalStore();

	export let courses: Course[] = [];
	export let selectedCourseId: number | null = null;

	let showMyCourses = true;



	const modal: ModalSettings = {
		type: 'confirm',
		title: 'Are you sure you want to delete this course?',
		body: 'It will be removed from all publications that are associated with it. Their metadata will remain the same.',
		response: async (r: boolean) => {
			if (r) {
				courses = courses.filter(c => c.id !== selectedCourseId);
				await fetch(`/api/course/${selectedCourseId}`, {
					method: 'DELETE',
					headers: {
						'Content-Type': 'application/json'
					}
				});
			}
		}
	};


	let showModal = false;

	const openNewCourseModal = () => {
		showModal = true;
		dispatch('showCourseModal');
	};


	const closeModal = () => showModal = false;

	const refresh = () => {
		// invalidate current page data or manually refetch from endpoint
	};
</script>

<div class="flex flex-wrap gap-2">

	<!--{#if showModal}-->
	<!--	<CourseModal existingCourse={null} onSuccess={refresh} close={closeModal} />-->
	<!--{/if}-->

	{#if showMyCourses}
		{#if Array.isArray(courses) && courses.length > 0}
			{#each courses as course}
				<CourseButton
					bind:course
					bind:selectedCourseId
					modalStore={modalStore}
					modal={modal} />

				{#if course !== courses[courses.length - 1]}
					<div class="w-px h-5 bg-gray-300 self-center"></div>
				{/if}
			{/each}
		{:else}
			<p>No courses available. Click button to add one.</p>
		{/if}


		<div class="flex gap-2 flex-wrap">
			{#if courses.length === 0}
				<button type="button" class="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-xl shadow-sm transition"
						on:click={() => openNewCourseModal()}>
					Add a course
				</button>
			{:else}
				<button type="button" name="add_maintainer" class="btn rounded-lg hover:bg-opacity-85 text-center"
						on:click={() => openNewCourseModal()}>
					<Icon icon="mdi:plus-circle" width="32" height="32"
						  class="bg-surface-0 text-surface-800 hover:text-surface-600" />
				</button>
			{/if}

			<button class="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-xl shadow-sm transition"
					type="button"
					on:click={() => showMyCourses = !showMyCourses}>
				Browse courses
			</button>
		</div>
	{:else}
		<BrowseCourses bind:selectedCourseId={selectedCourseId}/>
		<button class="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-xl shadow-sm transition"
				type="button"
				on:click={() => showMyCourses = !showMyCourses}>
			Show my courses
		</button>
	{/if}


</div>
