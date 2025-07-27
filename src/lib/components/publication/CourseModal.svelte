<script lang="ts">
	import {
		type Level,
		type User
	} from '@prisma/client';
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import MetadataLOandPK from '$lib/components/MetadataLOandPK.svelte';
	import CourseLevel from '$lib/components/publication/CourseLevel.svelte';
	import type { Course } from '$lib/database/courses';

	export let close: () => void; // to close the modal

	export let existingCourse: Course | null;
	export let onSuccess = () => {};
	let id = existingCourse?.id ?? null;



	let title = '';
	let level: Level;
	let learningObjectives: string[] = [];
	let prerequisites: string[] = [];

	type UserWithProfilePic = User & { profilePicData: string | null };
	let maintainers: UserWithProfilePic[] = [];
	const user = page.data.loggedUser as UserWithProfilePic;
	const isEdit = !!existingCourse;


	if (user) {
		maintainers.push(user);
	}

	const handleInputEnter = (event: KeyboardEvent) => {
		if (event.key === 'Enter') event.preventDefault();
	};
</script>

<div class="modal-bg">
	<form action="?/publish" method="POST" enctype="multipart/form-data"
		  class="modal-form" use:enhance={({ formData }) => {
			formData.append('title', title);
			formData.append('learningObjectives', JSON.stringify(learningObjectives));
			formData.append('prerequisites', JSON.stringify(prerequisites));
			formData.append('maintainers', JSON.stringify(maintainers.map(m => m.id)));
		}}>
		<h2 class="text-xl font-semibold mb-4">Create a course</h2>

		<label for="title">Title</label>
		<input type="text" id="title" name="title" bind:value={title} on:keydown={handleInputEnter} required>

		<CourseLevel bind:label={level} />
		<MetadataLOandPK bind:LOs={learningObjectives} bind:priorKnowledge={prerequisites} adding="{true}" />


		<div class="flex justify-between mt-4">
			<div class="flex gap-2">
				<button type="submit" class="btn-primary">{isEdit ? 'Save' : 'Create'}</button>
				<button type="button" class="btn-secondary" on:click={close}>Cancel</button>
			</div>
			{#if isEdit}
				<button type="button" class="btn-danger ml-auto" on:click={async () => {
				if (confirm('Are you sure you want to delete this course?')) {
					await fetch(`/api/course/${id}`, { method: 'DELETE' });
					onSuccess();
					close();
				}
			}}>
					Delete
				</button>
			{/if}
		</div>
	</form>
</div>

<style>
    .modal-bg {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 50;
    }
    .modal-form {
        background: white;
        padding: 2rem;
        border-radius: 1rem;
        width: 100%;
        max-width: 600px;
    }
</style>
