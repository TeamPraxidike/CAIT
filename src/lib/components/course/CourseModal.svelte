<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import CourseForm from './CourseForm.svelte';
	import type { UserWithProfilePic } from '$lib/util/coursesLogic.ts';

	export let close: () => void;
	// re-declare every prop CourseForm needs, so this wrapper's usage stays type-checked
	export let existingCourse;
	export let users;
	export let additionalMaintainers: UserWithProfilePic[] = [];
	export let searchableUsers = users;
	export let publisher;
	export let showCourseProgressRadial = false;

	onMount(() => document.body.classList.add("overflow-hidden"));
	onDestroy(() => document.body.classList.remove("overflow-hidden"));
</script>

<div class="modal-bg custom-scrollbar">
	<div class="modal-form">
		<CourseForm
			{close}
			{existingCourse}
			{users}
			bind:additionalMaintainers
			bind:searchableUsers
			{publisher}
			bind:showCourseProgressRadial
			on:courseCreated
			on:courseDeleted
		/>
	</div>
</div>

<style>
    .custom-scrollbar {
        scrollbar-width: thin;
        scrollbar-color: #888 #f1f1f100; /* thumb color, track color */
    }

    .modal-bg {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 50;
        padding: 1rem;
    }

    .modal-form {
        background: white;
        padding: 3rem;
        border-radius: 1.25rem;
        width: 100%;
        max-width: 800px;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    }
</style>


