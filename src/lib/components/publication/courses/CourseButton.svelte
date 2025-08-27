<script lang="ts">
	import type { Course, CourseWithCoverPic } from '$lib/database/courses';
	import { createEventDispatcher } from 'svelte';
	import Icon from '@iconify/svelte';
	import ConfirmDeleteCourse from '$lib/components/publication/courses/ConfirmDeleteCourse.svelte';
	import { deleteCourseById } from '$lib/util/coursesLogic';

	const dispatch = createEventDispatcher();
	let confirmDelete: any;

	export let selectedCourseId: number | null;
	export let previousCourseId: number | null;
	export let course: CourseWithCoverPic;

	export let canDelete = true;

	function selectType(courseId: number) {
		previousCourseId = selectedCourseId;
		selectedCourseId = selectedCourseId === courseId ? null : courseId;
	}

	async function confirmAndDelete(courseId: number) {
		try {
			await deleteCourseById(courseId);
			if (courseId === selectedCourseId) {
				selectedCourseId = null;
			}
			dispatch('courseDeleted', { courseId });
		} catch (e) {
			console.error(e);
		}
	}
</script>

<ConfirmDeleteCourse bind:this={confirmDelete} />

<button
	type="button"
	on:click={() => selectType(course.id)}
	class="group relative px-2 py-1.5 rounded-lg border border-gray-300 text-sm leading-5 font-medium
			   hover:bg-gray-100 hover:text-black transition
			   {course.id === selectedCourseId ? 'border-primary-600 border-2 text-primary-700 bg-primary-50' : 'bg-white text-gray-800'}"
>
	{course.courseName}
	{#if canDelete}
		<button
			type="button"
			class="absolute -top-2 right-2 opacity-0 group-hover:opacity-100 bg-primary-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs cursor-pointer"
			aria-label="Edit course"
			on:click|stopPropagation={() => {
				dispatch('editCourse', { course });
			}}
		>
			<Icon icon="mdi:pencil" width="10" height="10" />
		</button>
	{/if}
	{#if canDelete}
		<button
			type="button"
			class="absolute -top-2 -right-2.5 opacity-0 group-hover:opacity-100 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs cursor-pointer"
			aria-label="Delete course"
			on:click={() => {
				confirmDelete.open({ courseId: course.id, onConfirm: confirmAndDelete });
			}}
		>
			<Icon icon="mdi:close" width="12" height="12" />
		</button>
	{/if}
</button>