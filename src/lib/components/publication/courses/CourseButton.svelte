<script lang="ts">
	import type { Course } from '$lib/database/courses';
	import type { ModalSettings } from '@skeletonlabs/skeleton';

	export let selectedCourseId: number | null;
	export let previousCourseId: number | null;
	export let course: Course;
	export let modalStore;
	export let modal: ModalSettings;
	export let canDelete = true;

	function selectType(courseId: number) {
		previousCourseId = selectedCourseId;
		selectedCourseId = selectedCourseId === courseId ? null : courseId;
	}
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
			on:click={() => modalStore.trigger(modal)}
		>
			x
		</button>
	{/if}
</button>