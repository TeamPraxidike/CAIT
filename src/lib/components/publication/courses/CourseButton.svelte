<script lang="ts">
	import type { CourseWithCoverPic } from '$lib/database/courses';
	import { createEventDispatcher } from 'svelte';
	import Icon from '@iconify/svelte';

	const dispatch = createEventDispatcher();

	export let selectedCourseId: number | null;
	export let previousCourseId: number | null;
	export let course: CourseWithCoverPic;

	export let canEdit = true;

	function selectType(courseId: number) {
		previousCourseId = selectedCourseId;

		// if we have clicked on the currently selected course
		if (selectedCourseId === courseId){
			dispatch('deselectCourse');
			selectedCourseId = null;
		} else selectedCourseId = courseId;
	}
</script>

<button
	type="button"
	on:click={() => selectType(course.id)}
	class="group relative px-2 py-1.5 rounded-lg border border-gray-300 text-sm leading-5 font-medium
			   hover:bg-gray-100 hover:text-black transition
			   {course.id === selectedCourseId ? 'border-primary-600 border-2 text-primary-700 bg-primary-50' : 'bg-white text-gray-800'}"
>
	{course.courseName}
	{#if canEdit}
		<button
			type="button"
			class="absolute -top-2 right-0 opacity-0 group-hover:opacity-100 bg-primary-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs cursor-pointer"
			aria-label="Edit course"
			on:click|stopPropagation={() => {
				dispatch('editCourse', { course });
			}}
		>
			<Icon icon="mdi:pencil" width="10" height="10" />
		</button>
	{/if}
</button>