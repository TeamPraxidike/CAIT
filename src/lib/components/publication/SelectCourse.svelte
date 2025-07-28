<script lang="ts">
	import type { Course } from '$lib/database/courses';
	import CourseList from '$lib/components/publication/courses/CourseList.svelte';

	export let courses: Course[];
	export let selectedCourseId: number | null = null;
</script>

<div class="flex flex-wrap gap-2">
	<CourseList bind:courses={courses} bind:selectedCourseId={selectedCourseId}/>
	<button class="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-xl shadow-sm transition"
			on:click={() => window.open('/courses/browse')}>
		Browse courses
	</button>
</div>
