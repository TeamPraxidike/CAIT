<script lang="ts">
	import type { Course } from '$lib/database/courses';
	import CourseList from '$lib/components/publication/courses/CourseList.svelte';

	export let courses: Course[];
	export let selectedCourseId: number | null = null;

	let myCourses = true;
</script>

<div class="flex flex-wrap gap-2">
	{#if myCourses}
		<CourseList bind:courses={courses} bind:selectedCourseId={selectedCourseId}/>
		<button type="button"
				class="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-xl shadow-sm transition"
				on:click={() => myCourses = !myCourses}>
			Browse courses
		</button>
	{:else}

		<button type="button"
				class="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-xl shadow-sm transition"
				on:click={() => myCourses = !myCourses}>
			My courses
		</button>
	{/if}
</div>
