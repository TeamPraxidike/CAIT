<script lang="ts">
	import type { Course } from '@prisma/client';
	import { popup } from '@skeletonlabs/skeleton';
	import { createEventDispatcher } from 'svelte';
	import type { PopupSettings } from '@skeletonlabs/skeleton';

	// data coming in
	// export let item: any;
    export let view: 'home' | 'publish' | 'material' | 'search';
    export let course: Course;
	export let className: string = 'col-span-2';
	export let coursePhotoUrl: string | null;

    const defaultCoursePicturePath = "/defaultCoverPic/assignment.jpg"
	const randomNumber = Math.floor(Math.random() * 1000);
	let hoverName = '' + course.courseName + randomNumber;
	const popupHoverTop: PopupSettings = {
		event: 'hover',
		target: hoverName,
		placement: 'top',
		middleware: {
			offset: 2
		}
	};

	// events going out
	const dispatch = createEventDispatcher();

	// function open() {
	// 	dispatch('open', { id: item?.id });
	// }
</script>

<!-- markup -->
{#if view === "search"}
	<a href='/courses/{course.courseName}' style="height:fit-content"
	   class="{className} flex md:h-60 text-surface-800 dark:text-surface-50 overflow-hidden card dark:bg-surface-700 p-2 md:p-3  card-hover bg-surface-50 hover:cursor-pointer rounded-lg hover:shadow-lg shadow">
		<div class="flex flex-col space-y-1 items-start w-full md:pb-2">
			<div class="w-full flex flex-col items-center">
				{#if coursePhotoUrl !== null}
					<img src={coursePhotoUrl} alt="Course Profile" class="w-10 h-10 md:w-20 md:h-20 rounded-full object-cover" />
				{:else}
					<img src={defaultCoursePicturePath} alt="Course Profile" class="w-10 h-10 md:w-20 md:h-20 rounded-full object-cover" />
				{/if}
				<div class="max-w-full items-center">
					<span class="dark:text-surface-50 text-surface-900 max-w-full truncate md:text-2xl"
						 use:popup={popupHoverTop}>{course.courseName}</span>
					<hr class="dark:bg-surface-50 bg-surface-300" />
				</div>
			</div>
			<div class="flex justify-between items-start w-full">
				<span class="dark:text-surface-50 text-surface-800 text-xs md:text-sm">ID: {course.id}</span>
				<span class="dark:text-surface-50 text-surface-800 text-xs md:text-sm">Level: {course.educationalLevel}</span>
			</div>
		</div>
	</a>
{:else}


{/if}

<!-- <style>
	.card {
		padding: 1rem;
		border-radius: 0.5rem;
		border: 1px solid #ddd;
		cursor: pointer;
	}
</style> -->
