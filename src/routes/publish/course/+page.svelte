<script lang="ts">
	import CourseModal from '$lib/components/publication/CourseModal.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import type { PageServerData } from './$types';
	import type { UserWithProfilePic } from '$lib/util/coursesLogic';
	import CourseForm from '$lib/components/course/CourseForm.svelte';

	export let data: PageServerData;

	const loggedUser = page.data.loggedUser as UserWithProfilePic;
	let searchableUsers: UserWithProfilePic[] = data.users.filter((u) => u.id !== loggedUser.id);

	// Get course ID from URL params if editing
	const courseId = new URLSearchParams(page.url.search).get('id');
	const existingCourse = courseId ? data.courses.find(c => c.id === parseInt(courseId)) : null;

	let showCourseProgressRadial = false;
	let additionalMaintainers: UserWithProfilePic[] = existingCourse
		? (existingCourse.maintainers || []).filter((m: any) => m.id !== loggedUser.id)
		: [];

	function closeModal() {
		goto(new URLSearchParams(page.url.search).get('returnTo') || '/publish/materials');
	}
</script>

<CourseForm
	existingCourse={null}
	publisher={loggedUser}
	bind:searchableUsers={searchableUsers}
	users={data.users}
	bind:showCourseProgressRadial
	bind:additionalMaintainers
	on:courseCreated={() => goto('/courses')}
/>