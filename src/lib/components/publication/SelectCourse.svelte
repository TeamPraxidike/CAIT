<script lang="ts">
	import type { Course } from '$lib/database/courses';
	import { getModalStore, type ModalSettings, type PopupSettings } from '@skeletonlabs/skeleton';
	import { createEventDispatcher } from 'svelte';
	import Icon from '@iconify/svelte';
	import CourseButton from '$lib/components/publication/courses/CourseButton.svelte';
	const dispatch = createEventDispatcher();

	import {Autocomplete, type AutocompleteOption, popup} from "@skeletonlabs/skeleton";



	const modalStore = getModalStore();

	export let courses: Course[] = [];
	export let allCourses: Course[]	= [];
	export let selectedCourseId: number | null = null;

	let showMyCourses = false;

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
		console.log(e);
		selectedCourseId = parseInt(e.detail.value, 10);
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


	let showModal = false;

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
		{#if Array.isArray(courses) && courses.length > 0}
			{#each courses as course}
				<CourseButton
					bind:course
					bind:selectedCourseId
					modalStore={modalStore}
					modal={modal} />

				{#if course !== courses[courses.length - 1]}
					<div class="w-px h-5 bg-gray-300 self-center"></div>
				{/if}
			{/each}
		{:else}
			<p></p>
		{/if}


		{#if courses.length === 0}
			<button type="button" class="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-xl shadow-sm transition"
					on:click={() => openNewCourseModal()}>
				Add a course
			</button>
		{:else}
			<button type="button" name="add_maintainer" class="btn rounded-lg hover:bg-opacity-85 text-center"
					on:click={() => openNewCourseModal()}>
				<Icon icon="mdi:plus-circle" width="32" height="32"
					  class="bg-surface-0 text-surface-800 hover:text-surface-600" />
			</button>
		{/if}
	</div>


	<div class="w-1/2">
		<input
			class="input autocomplete"
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
