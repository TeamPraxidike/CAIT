<script lang="ts">
	import type { CourseWithMaintainersAndProfilePic } from '$lib/database/courses';
	import CourseModal from '$lib/components/course/CourseModal.svelte';
	import ShareButton from '../publication/ShareButton.svelte';
	import { UserProp } from '$lib';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { getModalStore, type ModalSettings } from '@skeletonlabs/skeleton';
	import Icon from '@iconify/svelte';

	export let course: CourseWithMaintainersAndProfilePic | undefined;
	if (!course) {
		throw new Error(
			'There was an error with exporting the course data. Please try again.',
		);
	}
	const deletionTarget = course;

	let coverpic = course?.coverPic?.data;

	// export let userPhotoUrl: string;
	// export let tabset: number;

	// const numPosts = user.posts.filter((x) => !x.isDraft).length
	// const numDrafts = user.posts.filter((x) => x.isDraft).length

	const courseName = course.courseName;
	const modalStore = getModalStore();
	$: canDeleteCourse =
		course.maintainers.some((maintainer) => maintainer.id === page.data.session?.user.id) ||
		page.data.loggedUser?.isAdmin === true ||
		page.data.loggedUser?.role === 'MODERATOR' ||
		page.data.loggedUser?.role === 'ADMIN';

	async function deleteCourse() {
		const response = await fetch(`/api/course/${deletionTarget.id}`, { method: 'DELETE' });
		if (!response.ok) {
			throw new Error(`Failed to delete course: ${response.status}`);
		}
		await goto('/browse?type=courses');
	}

	function confirmCourseDeletion() {
		const modal: ModalSettings = {
			type: 'confirm',
			title: 'Delete course',
			body: 'Delete this course? Its publications will be kept and unlinked from it.',
			response: async (confirmed: boolean) => {
				if (confirmed) await deleteCourse();
			},
		};
		modalStore.trigger(modal);
	}

	const defaultProfilePicturePath = '/defaultProfilePic/profile.jpg';
	function openModal() {
		showModal = true;
	}

	function closeModal() {
		showModal = false;
	}

	// const uploadFile
	let showModal = false;
</script>

<div
	class="col-span-4 flex flex-col items-center gap-2 text-surface-800 rounded-b-lg pb-4 border border-surface-300 border-t-0 self-start
            sm:col-span-4 sm:flex-row sm:px-8 sm:flex-wrap
            md:col-span-8 md:py-8
            lg:col-span-12 lg:px-4
            xl:col-span-3
            dark:bg-surface-800 dark:text-surface-50 dark:border-none">
	<!--{#if userPhotoUrl !== ''}-->
	<!--    <img src={userPhotoUrl} alt="User Profile" class="w-32 h-32 md:w-40 my-4 md:h-40 rounded-full object-cover" />-->
	<!--{:else}-->
	<!--    <div class="w-20 h-20 md:w-40 md:h-40 rounded-full bg-surface-500 placeholder-circle" />-->
	<!--{/if}-->
	<img
		src={coverpic ? coverpic : defaultProfilePicturePath}
		alt="course"
		class="w-full max-h-[400px] object-cover border rounded" />

	<div class="flex w-full min-w-0 flex-col px-2 gap-2">
		<h2 class="text-lg md:text-xl break-words min-w-0">{courseName}</h2>
		<div class="flex flex-wrap items-center gap-2">
			<ShareButton
				path={`/courses/${encodeURIComponent(courseName)}`}
				title={courseName}
				learningObjectives={course?.learningObjectives ?? []}
				style="flex items-center btn text-surface-500 px-2 py-1 border rounded-lg" />
			{#if canDeleteCourse}
				<button
					type="button"
					class="btn p-1"
					aria-label="Delete course"
					title="Delete course"
					on:click={confirmCourseDeletion}>
					<Icon icon="mdi:trash-can-outline" width="24" class="text-error-400" />
				</button>
			{/if}
		</div>
	</div>
	<hr class="w-11/12" />
	<div class="flex items-start gap-2">
		<div class="flex flex-col">
			<span class="font-bold text-surface-800">Learning Objectives</span>
			<ul class="list-inside">
				{#if course.learningObjectives.length === 0}
					<span>No learning objectives have been indicated</span>
				{:else}
					{#each course.learningObjectives as lo}
						<li class="list text-surface-700 text-sm list-disc">
							{lo}
						</li>
					{/each}
				{/if}
			</ul>
		</div>
		<div class="flex flex-col">
			<span class="font-bold text-surface-800">Prior Knowledge:</span>
			<ul class="list-inside">
				{#if course?.prerequisites.length === 0}
					<span class="text-surface-800"
						>No prior knowledge has been indicated</span>
				{:else}
					{#each course?.prerequisites as pk}
						<li class="list text-surface-700 text-sm list-disc">
							{pk}
						</li>
					{/each}
				{/if}
			</ul>
		</div>
	</div>

	<div class="flex gap-4">
		<p class="lg:text-sm 2xl:text-base">
			<span class="font-bold text-surface-800">Level:</span> {course?.educationalLevel}
		</p>
		<p class="lg:text-sm 2xl:text-base">
			<span class="font-bold text-surface-800">Copyright:</span> {course?.copyright}
		</p>
	</div>
	<hr class="w-11/12" />
	<div class="flex flex-col gap-4 w-full">
		<span class="font-bold text-surface-800">Maintainers:</span>
		<div class="flex flex-col gap-2 ">
			{#each course?.maintainers as maintainer}
				<UserProp
					role="Maintainer"
					subject={course}
					userPhotoUrl={maintainer.profilePicData}
					view="material"
					user={maintainer} />
			{/each}
		</div>
	</div>
    
</div>


{#if showModal}
	<CourseModal
		existingCourse={null}
		close={closeModal} />
{/if}
