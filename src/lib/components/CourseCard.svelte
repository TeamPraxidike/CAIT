<script lang="ts">
	import type { Course } from '@prisma/client';
	import { popup } from '@skeletonlabs/skeleton';
	import { createEventDispatcher } from 'svelte';
	import type { PopupSettings } from '@skeletonlabs/skeleton';

	// data coming in
	// export let item: any;
	export let view: 'home' | 'publish' | 'material' | 'search';
	export let course: Course;
	export let className: string = 'col-span-4 lg:col-span-3 3xl:col-span-2';
	export let coursePhotoUrl: string | null;

	const defaultCoursePicturePath = '/defaultCoverPic/assignment.jpg';
	const randomNumber = Math.floor(Math.random() * 1000);
	let hoverName = '' + course.courseName + randomNumber;
	const popupHoverTop: PopupSettings = {
		event: 'hover',
		target: hoverName,
		placement: 'top',
		middleware: {
			offset: 2,
		},
	};

	// events going out
	const dispatch = createEventDispatcher();

	// function open() {
	// 	dispatch('open', { id: item?.id });
	// }
</script>

<!-- markup -->
<!-- {#if view === "search"} -->

<div class="{className} flex items-center">
	<a
		href="/courses/{course.courseName}"
		style="height:fit-content"
		class=" w-full h-[360px] rounded-lg shadow-md bg-surface-50 dark:bg-surface-800 border dark:border-none">
		<div class="flex flex-col space-y-1 items-start w-full md:pb-2">
			<div class="w-full relative h-2/5 rounded-t-lg">
				<img
					src={coursePhotoUrl ?? defaultCoursePicturePath}
					alt="Course Profile"
					class="w-full aspect-[2/1] object-cover rounded-t-lg" />
			</div>
			<hr class="w-full" />
			<div class="w-full text-center px-3">
				<span
					class="dark:text-surface-50 text-surface-900 max-w-full truncate md:text-2xl"
					use:popup={popupHoverTop}>{course.courseName}</span>
				<!-- <hr class="dark:bg-surface-50 bg-surface-300" /> -->
			</div>
			<!-- <hr class="w-11/12 items-center" /> -->
			<div class="flex justify-between items-start w-full px-4">
				<span
					class="dark:text-surface-50 text-surface-800 text-xs md:text-sm"
					>Copyright: {course.copyright}</span>
				<span
					class="dark:text-surface-50 text-surface-800 text-xs md:text-sm"
					>Level: {course.educationalLevel}</span>
			</div>
			<hr class="w-full" />
			<div class="flex justify-between items-start w-full px-4">
				<span
					class="dark:text-surface-50 text-surface-800 text-xs md:text-sm"
					> {course.id}</span>
				<span
					class="dark:text-surface-50 text-surface-800 text-xs md:text-sm"
					>Number of pubs in course: {NaN}</span>
			</div>
		</div>
	</a>
</div>
<!-- {:else}


{/if} -->

<!-- <style>
	.card {
		padding: 1rem;
		border-radius: 0.5rem;
		border: 1px solid #ddd;
		cursor: pointer;
	}
</style> -->
