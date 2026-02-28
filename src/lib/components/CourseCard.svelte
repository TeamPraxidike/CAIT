<script lang="ts">
	import type { Course } from '@prisma/client';
	import { popup } from '@skeletonlabs/skeleton';
	import { createEventDispatcher, onMount } from 'svelte';
	import type { PopupSettings } from '@skeletonlabs/skeleton';
	import LevelIcon from './publication/card/LevelIcon.svelte';
	import { Tag } from '$lib';
	import type { CourseWithProcessedProfilePic } from '../../routes/api/course-extended/+server';
	import { fly } from 'svelte/transition';
	import BrowseCardShell from './BrowseCardShell.svelte';

	// data coming in
	// export let item: any;
	// export let view: 'home' | 'publish' | 'material' | 'search';
	export let course: CourseWithProcessedProfilePic;
	export let className: string = 'col-span-4 lg:col-span-3 3xl:col-span-2';
	export let coursePhotoUrl: string | null;
	export let numPubs: number = NaN;
	let tagWidths: number[] = course.learningObjectives.map(() => 0);

	const defaultCoursePicturePath = '/defaultCoverPic/assignment.jpg';
	const defaultProfilePicturePath = '/defaultProfilePic/profile.jpg';
	const randomNumber = Math.floor(Math.random() * 1000);
	let hoverName = '' + course.courseName + randomNumber;
	let container: HTMLDivElement;

	let isHoveredPfp = false;
	let pfpElement: HTMLDivElement;
	let containerWidth: number = 0;
	const updateContainerWidth = () => {
		if (container) {
			containerWidth = container.getBoundingClientRect().width;
			maxTags = calcMaxTags();
		}
	};
	const handlePfpHover = () => (isHoveredPfp = !isHoveredPfp);
	const calcMaxTags = () => {
		let res = 0;
		let currentWidth = 0;

		for (let i = 0; i < tagWidths.length; i++) {
			let checkLast =
				i === tagWidths.length - 1 ? tagWidths[i] : tagWidths[i] + 24;

			if (!(currentWidth + checkLast <= containerWidth)) {
				break;
			}

			currentWidth += tagWidths[i] + 8;
			res++;
		}
		return res;
	};
	onMount(() => {
		containerWidth = container.getBoundingClientRect().width;
		window.addEventListener('resize', updateContainerWidth);

		maxTags = calcMaxTags();
		if (pfpElement) {
			pfpElement.addEventListener('mouseenter', handlePfpHover);
			pfpElement.addEventListener('mouseleave', handlePfpHover);
			return () => {
				if (pfpElement) {
					pfpElement.removeEventListener(
						'mouseenter',
						handlePfpHover,
					);
					pfpElement.removeEventListener(
						'mouseleave',
						handlePfpHover,
					);
				}
			};
		}
	});

	let maxTags = course.learningObjectives.length;
	const popupHoverTop: PopupSettings = {
		event: 'hover',
		target: hoverName,
		placement: 'top',
		middleware: {
			offset: 2,
		},
	};

	// Assures currently displayed tab is 0 (materials/circuit)
	const resetTab = () => {
		dispatch('resetTab', { tabValue: 0 });
	};

	// events going out
	const dispatch = createEventDispatcher();

	// function open() {
	// 	dispatch('open', { id: item?.id });
	// }
</script>

<!-- markup -->
<!-- {#if view === "search"} -->

<BrowseCardShell
	className={className}
	forArrow={false}
	href={`/courses/${course.courseName}`}
	titleText={course.courseName}
	onCoverClick={resetTab}>
	
	<img
		slot="cover"
		class="w-full h-full object-cover rounded-t-lg hover:shadow-md"
		src={coursePhotoUrl ?? defaultCoursePicturePath}
		alt="Course Profile" />



	<div
		slot="icons"
		class="flex gap-2">
		<div class="self-center">
			<LevelIcon level={course.educationalLevel} />
		</div>
	</div>

	<div
		slot="tags"
		bind:this={container}
		class="flex w-full mt-2 gap-1 flex-nowrap overflow-visible">
		<div class="flex gap-1 relative">
			{#each course.learningObjectives.slice(0, maxTags) as tag, i}
				<Tag
					bind:width={tagWidths[i]}
					tagText={tag}
					removable={false} />
			{/each}
		</div>
	</div>

	<a
		slot="interaction-buttons"
		href="/courses/{course.courseName}"
		class="py-1 px-4 bg-surface-700 text-surface-50 rounded-lg hover:bg-opacity-85"
		on:click={resetTab}>View</a>

	


	<div
		slot="user-pfp"
		bind:this={pfpElement}
		class="relative inline-flex items-center">
		<a
			href="/{course.maintainers[0].username}"
			class="flex-none">
			<img
				class="w-5 h-5 md:w-6 md:h-6 rounded-full border object-cover"
				src={course.maintainers[0].profilePicData
					? course.maintainers[0].profilePicData
					: defaultProfilePicturePath}
				alt="CAIT Logo" />
		</a>
		{#if isHoveredPfp}
			<div
				class="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-surface-50 dark:bg-surface-800 shadow-md p-2 rounded-lg flex gap-2 items-center"
				style="z-index: 9999;"
				transition:fly={{ y: 8, duration: 400 }}>
				<div class="flex flex-col items-center">
					<p>
						{course.maintainers[0].firstName +
							' ' +
							course.maintainers[0].lastName}
					</p>
				</div>
			</div>
		{/if}
	</div>

</BrowseCardShell>

<!-- <div class="{className} flex items-center">
	<div
		class=" w-full h-[360px] rounded-lg shadow-md bg-surface-50 dark:bg-surface-800 border dark:border-none">
		<div class="w-full relative h-2/5 rounded-t-lg">
			<a
				href="/courses/{course.courseName}"
				class="flex-none"
				aria-label="Go to Course {course.courseName}"
				on:click={resetTab}>
				<img
					class="w-full h-full object-cover rounded-t-lg hover:shadow-md"
					src={coursePhotoUrl ?? defaultCoursePicturePath}
					alt="Course Profile" />
			</a>
		</div>
		<div
			class="flex flex-col justify-between px-2 py-2 w-full h-3/5 border-t border-surface-300 dark:border-surface-700 items-center justify-elements-center">
			<div class="w-full">
				<div class="flex justify-between items-start">
					<a
						href="/courses/{course.courseName}"
						class="line-clamp-2 font-bold text-surface-700 max-w-[80%] text-sm dark:text-surface-200 self-center hover:text-surface-500"
						on:click={resetTab}>
						{course.courseName}
					</a>
					<div class="flex gap-2">
						<div class="self-center">
							<LevelIcon level={course.educationalLevel} />
						</div>
					</div>
				</div>
			</div>
			<div
				bind:this={container}
				class="flex w-full mt-2 gap-1 flex-nowrap overflow-visible">
				<div class="flex gap-1 relative">
					{#each course.learningObjectives.slice(0, maxTags) as tag, i}
						<Tag
							bind:width={tagWidths[i]}
							tagText={tag}
							removable={false} />
					{/each}
				</div>
			</div>
			<div class="w-full space-y-2">
				<hr class="opacity-50" />
				<div class="w-full flex justify-between">
					<div class="w-full flex justify-left space-x-4">
						<a
							href="/courses/{course.courseName}"
							class="py-1 px-4 bg-surface-700 text-surface-50 rounded-lg hover:bg-opacity-85"
							on:click={resetTab}>View</a>
					</div>
				</div>
			</div>
			<div class="flex gap-1 items-center pr-5">
				<div
					bind:this={pfpElement}
					class="relative inline-flex items-center">
					<a
						href="/{course.maintainers[0].username}"
						class="flex-none">
						<img
							class="w-5 h-5 md:w-6 md:h-6 rounded-full border object-cover"
							src={course.maintainers[0].profilePicData
								? course.maintainers[0].profilePicData
								: defaultProfilePicturePath}
							alt="CAIT Logo" />
					</a>
					{#if isHoveredPfp}
						<div
							class="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-surface-50 dark:bg-surface-800 shadow-md p-2 rounded-lg flex gap-2 items-center"
							style="z-index: 9999;"
							transition:fly={{ y: 8, duration: 400 }}>
							<div class="flex flex-col items-center">
								<p>
									{course.maintainers[0].firstName +
										' ' +
										course.maintainers[0].lastName}
								</p>
							</div>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div> -->

<!-- <a
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
			</div>
			<div class="flex justify-between items-start w-full px-4">
				<span
					class="dark:text-surface-50 text-surface-800 text-xs md:text-sm"
					>Copyright: {course.copyright}</span>
				<LevelIcon level={course.educationalLevel} />
			</div>
			<hr class="w-full" />
			<div class="flex justify-between items-start w-full px-4">
				<span
					class="dark:text-surface-50 text-surface-800 text-xs md:text-sm">
					{course.id}</span>
				<span
					class="dark:text-surface-50 text-surface-800 text-xs md:text-sm"
					>Contains {numPubs} {numPubs == 1 ? 'item' : 'items'}</span>
			</div>
		</div>
	</a> -->
<!-- </div> -->
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
