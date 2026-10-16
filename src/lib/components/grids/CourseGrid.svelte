<script>
	import CourseCard from '$lib/components/CourseCard.svelte';

	export let courses;
	export let emptyMessage;
	console.log(courses);
</script>

{#if courses.length === 0}
	<p class="col-span-2 text-center">{emptyMessage}</p>
{:else}
	<div class="grid grid-cols-2 gap-4">
		{#each courses as course}
			<div class="col-span-1">
				<CourseCard course={course}
							className="col-span-1"
							coursePhotoUrl={course.coverPic.data}
							numPubs={course.publications.length}></CourseCard>
			</div>
		{/each}
	</div>
{/if}