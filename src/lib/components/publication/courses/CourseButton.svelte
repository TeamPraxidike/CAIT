<script lang="ts">
	import type { Course } from '$lib/database/courses';
	import { getModalStore, type ModalSettings } from '@skeletonlabs/skeleton';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();
	const modalStore = getModalStore();

	export let selectedCourseId: number | null;
	export let previousCourseId: number | null;
	export let course: Course;

	export let canDelete = true;

	function selectType(courseId: number) {
		previousCourseId = selectedCourseId;
		selectedCourseId = selectedCourseId === courseId ? null : courseId;
	}

	const modal: ModalSettings = {
		type: 'confirm',
		title: 'Are you sure you want to delete this course?',
		body: 'It will be removed from all publications that are associated with it. Their metadata will remain the same.',
		response: async (r: boolean) => {
			if (r) {
				const id = modal.meta.courseId;
				dispatch('courseDeleted', { courseId: id }); // inform parent component, so that it can update the UI

				await fetch(`/api/course/${id}`, {
					method: 'DELETE',
					headers: {
						'Content-Type': 'application/json'
					}
				});

				if (id === selectedCourseId) {
					selectedCourseId = null;
				}
			}
		}
	};
</script>

<button
	type="button"
	on:click={() => selectType(course.id)}
	class="group relative px-2 py-1 text-sm font-medium
			   transition hover:font-bold
			   {course.id === selectedCourseId ? 'bg-primary-600 text-white border-primary-500 rounded-full' : 'bg-white text-gray-800'}"
>
	{course.courseName}
	{#if canDelete}
		<button
			type="button"
			class="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs cursor-pointer"
			aria-label="Delete course"
			on:click={() => {
				// pass along which course to delete
				modal.meta = {
					courseId: course.id
				};
				modalStore.trigger(modal)
			}}
		>
			x
		</button>
	{/if}
</button>