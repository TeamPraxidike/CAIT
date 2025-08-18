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
	import MantainersEditBar from '$lib/components/user/MantainersEditBar.svelte';

	export let close: () => void; // to close the modal
	export let users: UserWithProfilePic[] = [];
	export let additionalMaintainers: UserWithProfilePic[] = [];
	export let searchableUsers = users;
	export let publisher: UserWithProfilePic


	export let existingCourse: Course | null;
	export let onSuccess = () => {};
	let id = existingCourse?.id ?? null;

	let title = '';
	let level: Level;
	let learningObjectives: string[] = [];
	let prerequisites: string[] = [];
	let copyright: string = "";

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
	let form:HTMLFormElement


	$: isFormValid = title.trim().length > 0 && level !== undefined && learningObjectives.length > 0;
	// $: if ()



</script>

<div class="modal-bg">
	<form
		action="?/publishCourse"
		method="POST"
		bind:this={form}
		enctype="multipart/form-data"
		class="modal-form space-y-6"
		use:enhance={({ formData }) => {
			formData.append('title', title);
			formData.append('learningObjectives', JSON.stringify(learningObjectives));
			formData.append('prerequisites', JSON.stringify(prerequisites));
			formData.append('maintainers', JSON.stringify(additionalMaintainers.map(m => m.id)));
			formData.append('level', level);
			formData.append('context', 'course-form');
			formData.append('copyright', copyright);

			close();

		}}>
		<input type="hidden" name="formContext" value="course-modal" />

		<h2 class="text-2xl font-bold mb-4">Create a Course</h2>

		<div class="space-y-2">
			<label for="title" class="block font-medium">Name<span class="text-error-300">*</span></label>
			<input
				type="text"
				id="title"
				name="title"
				bind:value={title}
				on:keydown={handleInputEnter}
				required
				class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-400"
			/>
		</div>


		<div class="flex flex-row justify-start items-center gap-10 mb-4">
			<div>
				<label for="Level" class="block font-medium">Education Level<span class="text-error-300">*</span></label>
				<CourseLevel bind:label={level} />
			</div>

			<div>
				<label for="copyright" class="block font-medium">Copyright</label>
				<input type="text"
					   name="copyright"
					   bind:value={copyright}
					   on:keydown={handleInputEnter}
					   required
					   class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-400"
				/>
			</div>

		</div>

		<MantainersEditBar publisher={publisher} bind:searchableUsers={searchableUsers} users={users}
						   bind:additionalMaintainers={additionalMaintainers} />
		<MetadataLOandPK bind:LOs={learningObjectives} bind:priorKnowledge={prerequisites} adding="{true}" />


		<div class="flex justify-end items-center pt-4">
			<div class="flex gap-3">
				<button class:opacity-50={!isFormValid} disabled={!isFormValid} type="submit" class="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-xl shadow-sm transition">{isEdit ? 'Save' : 'Create'}</button>
				<button type="button" class="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-xl shadow-sm transition" on:click={close}>Cancel</button>
			</div>

			{#if isEdit}
				<button
					type="button"
					class="btn-danger text-sm px-5 py-2 ml-auto"
					on:click={async () => {
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
        padding: 1rem;
    }

    .modal-form {
        background: white;
        padding: 3rem;
        border-radius: 1.25rem;
        width: 100%;
        max-width: 800px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    }
</style>
