<script lang="ts">
	import { page } from '$app/state';
	// import type { TUserWithPostsAndProfilePic } from '$lib/database/user';
	import type { CourseWithMaintainersAndProfilePic } from '$lib/database/courses';
	import CourseModal from '$lib/components/publication/CourseModal.svelte';
	import { UserProp } from '$lib';

	export let course: CourseWithMaintainersAndProfilePic | undefined;
	if (!course) {
		throw new Error(
			'There was an error with exporting the course data. Please try again.',
		);
	}

	console.log(course?.coverPic);
	let coverpic = course?.coverPic?.data;

	// export let userPhotoUrl: string;
	// export let tabset: number;

	// const numPosts = user.posts.filter((x) => !x.isDraft).length
	// const numDrafts = user.posts.filter((x) => x.isDraft).length

	const courseName = course.courseName;

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
		alt="course}"
		class="w-full h-auto object-cover border rounded" />

	<div
		class="flex px-2 justify-center gap-x-4 gap-y-2 flex-wrap items-center
                sm:flex-col sm:items-start
                md:w-7/12 md:justify-start
                xl:w-full">
		<h2 class="text-lg md:text-xl">{courseName}</h2>
	</div>
	<hr class="w-11/12" />
	<div class="flex items-start gap-2">
		<div class="flex flex-col">
			<span class="font-bold text-surface-800">Learning Objectives</span>
			<ul class="list-inside">
				{#if course?.learningObjectives.length === 0}
					<span>No learning objectives have been indicated</span>
				{:else}
					{#each course?.learningObjectives as lo}
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
	<div class="flex flex-col">
		<span class="font-bold text-surface-800">Maintainers:</span>
		<div class="flex flex-col">
			{#each course?.maintainers as maintainer}
				<UserProp
					role="Maintainer"
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
