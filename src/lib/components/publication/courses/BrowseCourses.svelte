<script lang="ts">
	import type { Course } from '$lib/database/courses';
	import CourseButton from '$lib/components/publication/courses/CourseButton.svelte';
	import type { ModalSettings } from '@skeletonlabs/skeleton';

	export let courses: Course[];
	export let selectedCourseId: number | null;
	export let modalStore;
	export let modal: ModalSettings;

</script>

<div>
	{#if courses.length > 0}
		<div class="flex flex-wrap gap-2">
			{#each courses as course (course.id)}
				<CourseButton
					{course}
					{selectedCourseId}
					{modalStore}
					{modal}
					canDelete={false}
				/>
			{/each}
		</div>
	{:else}
		<p class="text-gray-500">No courses available.</p>
	{/if}
</div>