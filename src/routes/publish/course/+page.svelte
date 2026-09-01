<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import type { PageServerData } from './$types';
	import type { UserWithProfilePic } from '$lib/util/coursesLogic';
	import CourseForm from '$lib/components/course/CourseForm.svelte';

	export let data: PageServerData;

	const loggedUser = page.data.loggedUser as UserWithProfilePic;
	let searchableUsers: UserWithProfilePic[] = data.users.filter((u: UserWithProfilePic) => u.id !== loggedUser.id);

	// Get course ID from URL params if editing
	const courseId = new URLSearchParams(page.url.search).get('id');
	const existingCourse = courseId ? data.courses.find(c => c.id === parseInt(courseId)) : null;

	let showCourseProgressRadial = false;
	let additionalMaintainers: UserWithProfilePic[] = existingCourse
		? (existingCourse.maintainers || []).filter((m: any) => m.id !== loggedUser.id)
		: [];

</script>

<div class="col-span-full">
	<CourseForm
		existingCourse={null}
		publisher={loggedUser}
		bind:searchableUsers={searchableUsers}
		users={data.users}
		close={() => {goto('/browse')}}
		bind:showCourseProgressRadial
		bind:additionalMaintainers
		on:courseCreated={() => goto('/browse?type=courses')}
	/>
</div>
