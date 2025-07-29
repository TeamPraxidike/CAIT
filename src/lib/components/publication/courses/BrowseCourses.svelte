<script lang="ts">
	import type { Course } from '$lib/database/courses';
	import CourseButton from '$lib/components/publication/courses/CourseButton.svelte';
	import type { ModalSettings } from '@skeletonlabs/skeleton';
	import {Autocomplete, type AutocompleteOption, getToastStore, InputChip} from "@skeletonlabs/skeleton";

	export let courses: Course[];
	export let selectedCourseId: number | null;

	let selectedCourse: string;
	type CourseOption = AutocompleteOption<string, string>;

	let courseOptions: CourseOption[] = courses.map(course => {
		return {
			value: course.courseName,
			label: course.courseName
		};
	});
</script>

<div>
	{#if courses.length > 0}
		<div class="flex flex-wrap gap-2 ">
			<div class="w-full max-h-64 p-4 overflow-y-auto" tabindex="-1">
				<Autocomplete
					bind:input={selectedCourse}
					options={courseOptions}
				/>
			</div>
		</div>
	{:else}
		<p class="text-gray-500">No courses available.</p>
	{/if}
</div>
