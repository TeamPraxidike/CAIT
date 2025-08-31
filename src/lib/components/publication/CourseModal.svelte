<script lang="ts">
	import {
		type Level,
		type User
	} from '@prisma/client';
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import MetadataLOandPK from '$lib/components/MetadataLOandPK.svelte';
	import CourseLevel from '$lib/components/publication/CourseLevel.svelte';
	import type { CourseWithCoverPic } from '$lib/database/courses';
	import MantainersEditBar from '$lib/components/user/MantainersEditBar.svelte';
	import CoverPicSelect from '$lib/components/publication/CoverPicSelect.svelte';
	import { createEventDispatcher, onMount, onDestroy } from 'svelte';
	import ConfirmDeleteCourse from '$lib/components/publication/courses/ConfirmDeleteCourse.svelte';
	import { deleteCourseById } from '$lib/util/coursesLogic';
	import { downloadFileFromSupabase } from '$lib/util/file';

	let supabaseClient = page.data.supabase;

	export let close: () => void; // to close the modal
	export let users: UserWithProfilePic[] = [];
	export let additionalMaintainers: UserWithProfilePic[] = [];
	export let searchableUsers = users;
	export let publisher: UserWithProfilePic;
	export let courses: CourseWithCoverPic[];


	export let existingCourse: CourseWithCoverPic | null;
	export let onSuccess = () => {};
	let id = existingCourse?.id ?? null;

	let title = existingCourse?.courseName ?? '';
	let level: Level = existingCourse?.educationalLevel as Level;
	let learningObjectives: string[] = existingCourse?.learningObjectives ?? [];
	let prerequisites: string[] = existingCourse?.prerequisites ?? [];
	let copyright: string = existingCourse?.copyright ?? "";
	let coverPic: File | undefined = undefined;
	if (existingCourse) {
		// if data is not null, we have a custom cover picture, download it
		if (existingCourse.coverPic.data){
			downloadFileFromSupabase(supabaseClient, existingCourse.coverPic).then(f => {
				coverPic = f || undefined;
			})
		} else {
			coverPic = undefined;
		}
	}

	type UserWithProfilePic = User & { profilePicData: string | null };
	let maintainers: UserWithProfilePic[] = [];
	const user = page.data.loggedUser as UserWithProfilePic;
	const isEdit = !!existingCourse;

	const dispatch = createEventDispatcher();

	let confirmDelete: any;

	async function confirmAndDelete(courseId: number) {
		try {
			await deleteCourseById(courseId);
			dispatch('courseDeleted', { courseId });
			onSuccess();
			close();
		} catch (e) {
			console.error(e);
		}
	}


	if (user) {
		maintainers.push(user);
	}

	const handleInputEnter = (event: KeyboardEvent) => {
		if (event.key === 'Enter') event.preventDefault();
	};
	let form:HTMLFormElement


	$: isFormValid = title.trim().length > 0 && level !== undefined && learningObjectives.length > 0;

	onMount(() => {
		document.body.classList.add("overflow-hidden");
	});

	onDestroy(() => {
		document.body.classList.remove("overflow-hidden");
	});

	export let showCourseProgressRadial = false;
</script>

<ConfirmDeleteCourse bind:this={confirmDelete} />

<div class="modal-bg custom-scrollbar">
	<form
		action={isEdit ? `?/editCourse` : "?/publishCourse"}
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
			if (isEdit && id !== null) formData.append('id', id.toString());
			formData.append('context', 'course-form');
			formData.append('copyright', copyright);
			formData.append('coverPic', coverPic || '');

			showCourseProgressRadial = true;
			return (result) => {
				showCourseProgressRadial = false;

				if (isEdit && existingCourse) {
					const res = result.result.data.course;
					existingCourse.courseName = res.courseName;
					existingCourse.learningObjectives = res.learningObjectives;
					existingCourse.prerequisites = res.prerequisites;
					existingCourse.educationalLevel = res.educationalLevel;
					existingCourse.copyright = res.copyright;
					existingCourse.coverPic = res.coverPic;
					existingCourse.maintainers = res.maintainers;
				} else {
					dispatch("CourseCreated", { course: result.result.data.course });
				}

				close();
			};
		}}>
		<input type="hidden" name="formContext" value="course-modal" />

		<h2 class="text-2xl font-bold mb-4">{isEdit ? 'Edit Course' : 'Create a Course'}</h2>

		<div class="space-y-2">
			<label for="title" class="block font-medium">Name<span class="text-error-300">*</span></label>
			<input
				type="text"
				id="title"
				name="title"
				bind:value={title}
				on:keydown={handleInputEnter}
				required
				class="rounded-lg dark:bg-surface-800 bg-surface-50 w-full text-surface-700 dark:text-surface-400 focus:border-primary-500 focus:ring-0"
			/>
		</div>

		<div class="flex flex-row justify-start items-center gap-10 mb-4">
		<div class="space-y-3">
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
		<CoverPicSelect bind:coverPic={coverPic}/>

		<div class="flex justify-end items-center pt-4">
			<div class="flex gap-3">
				<button
					type="button"
					class="text-surface-700 hover:bg-surface-100 font-semibold py-2 px-4 rounded-xl transition"
					on:click={close}>Cancel</button>
				{#if isEdit}
					<button
						type="button"
						class="bg-surface-900 text-white hover:bg-opacity-85 font-semibold py-2 px-4 rounded-xl shadow-sm transition"
						on:click={() => { if (id !== null) confirmDelete.open({ courseId: id, onConfirm: confirmAndDelete }); }}>
						Delete
					</button>
				{/if}
				<button class:opacity-50={!isFormValid} disabled={!isFormValid}
						type="submit"
						class="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-xl shadow-sm transition">
					{isEdit ? 'Save' : 'Create'}
				</button>
			</div>
		</div>
	</form>
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


