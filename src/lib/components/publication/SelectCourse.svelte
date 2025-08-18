<script lang="ts">
	import type { Course, CourseWithMaintainersAndProfilePic } from '$lib/database/courses';
	import { type PopupSettings } from '@skeletonlabs/skeleton';
	import { createEventDispatcher } from 'svelte';
	import Icon from '@iconify/svelte';
	import CourseButton from '$lib/components/publication/courses/CourseButton.svelte';
	const dispatch = createEventDispatcher();

	import {Autocomplete, type AutocompleteOption, popup} from "@skeletonlabs/skeleton";

	export let courses: Course[] = []; // all courses by the user
	export let allCourses: Course[]	= []; // all courses available in the system
	export let selectedCourseId: number | null = null; // the id of the course that is selected

	export let originalCourseIds = courses.map(c => c.id);

	let showMyCourses = false;

    // Show up to 10 courses; if more, show a "+N more…" chip at the end
    let maxVisible = 4;
    $: visibleCourses = Array.isArray(courses) ? courses.slice(0, maxVisible) : [];
    $: hiddenCount = Array.isArray(courses) ? Math.max(0, courses.length - maxVisible) : 0;

	let popupSettings: PopupSettings = {
		event: 'focus-click',
		target: 'popupAutocomplete',
		placement: 'bottom',
	};

	let inputPopupDemo: string = '';

	type CourseOption = AutocompleteOption<string, string>;

	let courseOptions: CourseOption[] = allCourses.map(course => {
		return {
			label: course.courseName,
			value: course.id.toString()
		};
	});


	function onCourseSelect(e: CustomEvent<CourseOption>): void {
		previousCourseId = selectedCourseId;
		selectedCourseId = parseInt(e.detail.value, 10);
		// courses.push(allCourses.find(course => course.id === selectedCourseId) as Course);
	}

	let previousCourseId: number | null = null;
	$: if (selectedCourseId !== null) {
		// If the selected course is not made by the user (i.e. not in the original course list),
		// add it to the courses list so that it can be displayed in the UI.
		if (!courses.some(course => course.id === selectedCourseId)) {
			courses = [...courses, allCourses.find(course => course.id === selectedCourseId) as CourseWithMaintainersAndProfilePic];
		}

		// If there was a previous course selected and it is not in the original course list (i.e. it was added dynamically),
		// remove it from the courses list.
		if (previousCourseId !== null && !originalCourseIds.includes(previousCourseId)) {
			courses = courses.filter(c => c.id !== previousCourseId);
		}
	}

	let showModal = false;

	function handleDeletion(e: CustomEvent<{ courseId: number }>) {
		const courseId = e.detail.courseId;
		courses = courses.filter(c => c.id !== courseId);
		if (selectedCourseId === courseId) {
			selectedCourseId = null;
		}
		dispatch('courseDeleted', { courseId });
	}

	function handleEdit(e: CustomEvent<{ course: Course }>) {
		dispatch('courseEditRequest', { course: e.detail.course });
	}

	const openNewCourseModal = () => {
		showModal = true;
		dispatch('showCourseModal');
	};


	const closeModal = () => showModal = false;

	const refresh = () => {
		// invalidate current page data or manually refetch from endpoint
	};
</script>

<div class="flex flex-col gap-2">

	<!--{#if showModal}-->
	<!--	<CourseModal existingCourse={null} onSuccess={refresh} close={closeModal} />-->
	<!--{/if}-->
	<div class="flex flex-wrap gap-2">
<!--		<label for="Your Courses">Your Courses:</label>-->

		{#if Array.isArray(courses) && courses.length > 0}
			{#each visibleCourses as course, idx}
				{#if originalCourseIds.includes(course.id)}
					<CourseButton
						bind:course
						bind:selectedCourseId
						bind:previousCourseId
						on:courseDeleted={handleDeletion}
						on:editCourse={handleEdit}/>
				{:else}
					<CourseButton
						bind:course
						bind:selectedCourseId
						bind:previousCourseId
						canDelete={false}
						on:courseDeleted={handleDeletion}
						on:editCourse={handleEdit}/>
				{/if}
			{/each}

            {#if hiddenCount > 0}
                <span class="self-center inline-flex items-center px-2 py-1 text-sm font-medium bg-white text-gray-800 select-none cursor-default">
                    +{hiddenCount} more…
                </span>
            {/if}
		{:else}
			<p></p>
		{/if}


		{#if courses.length === 0}
			<button type="button" class="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-xl shadow-sm transition"
					on:click={() => openNewCourseModal()}>
				Add a course
			</button>
		{:else}
		<button type="button" name="add_maintainer" 
				class="text-center flex items-center justify-center h-[32px]"
				on:click={() => openNewCourseModal()}>
			<Icon icon="mdi:plus-circle" width="32" height="32" class="bg-surface-0 text-primary-600 hover:text-primary-500 dark:text-surface-100 dark:hover:text-primary-600" />
		</button>
		{/if}
	</div>

<!--	<label for="browse"> Browse Courses</label>-->
	<div class="w-1/2">
		<input
			class="input autocomplete mt-1 text-sm"
			type="search"
			name="autocomplete-search"
			bind:value={inputPopupDemo}
			placeholder="Search Courses..."
			use:popup={popupSettings}
		/>
		<div data-popup="popupAutocomplete" class="popup w-64 max-h-64 overflow-y-auto bg-white border border-gray-300 rounded-lg shadow-lg p-4">
			<Autocomplete
				bind:input={inputPopupDemo}
				options={courseOptions}
				on:selection={onCourseSelect}
			/>
		</div>
	</div>
</div>
