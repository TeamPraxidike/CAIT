<script lang="ts">
	import Icon from '@iconify/svelte';
	import { getModalStore, type ModalSettings } from '@skeletonlabs/skeleton';
	import type { Course } from '$lib/database/courses';

	const modalStore = getModalStore();

	export let courses: Course[];
	export let selectedCourseId: number | null = null;

	function selectType(courseId: number) {
		selectedCourseId = selectedCourseId === courseId ? null : courseId;
	}

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


</script>

<div class="flex flex-wrap gap-2">
	{#each courses as course}
		<button
			type="button"
			on:click={() => selectType(course.id)}
			class="group relative px-2 py-1 text-sm font-medium
	   transition hover:font-bold
	   {course.id === selectedCourseId ? 'bg-primary-600 text-white border-primary-500 rounded-full' : 'bg-white text-gray-800'}"
		>
			{course.courseName}
			<button
				type="button"
				class="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs cursor-pointer"
				aria-label="Delete course"
				on:click={() => modalStore.trigger(modal)}
			>
				x
			</button>
		</button>
		{#if course !== courses[courses.length - 1]}
			<div class="w-px h-5 bg-gray-300 self-center"></div>
		{/if}
	{/each}

	{#if courses.length === 0}
		<button class="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-xl shadow-sm transition"
				on:click={() => window.location.href = '/course/create'}>
			Add a course
		</button>
	{:else}
		<button type="button" name="add_maintainer" class="btn rounded-lg hover:bg-opacity-85 text-center"
				on:click={() => window.location.href = '/course/create'}>
			<Icon icon="mdi:plus-circle" width="32" height="32"
				  class="bg-surface-0 text-surface-800 hover:text-surface-600" />
		</button>
	{/if}
	<button class="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-xl shadow-sm transition"
			on:click={() => window.open('/courses/browse')}>
		Browse courses
	</button>
</div>
