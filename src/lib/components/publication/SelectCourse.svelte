<script lang="ts">
	export let courses: string[] = ["SCE 101", "SCE 102", "SCE 103", "SCE 104", "SCE 105"];
	export let selectedCourse: string | null = null;

	function selectType(course: string) {
		selectedCourse = selectedCourse === course ? null : course;
		console.log(selectedCourse);
	}
</script>

<div class="grid grid-cols-1">
	<div class="flex flex-wrap gap-2">
		{#each courses as course}
			<button
				type="button"
				on:click={() => selectType(course)}
				class="px-2 py-1 text-sm font-medium
					   transition hover:font-bold
					   {course === selectedCourse ? 'bg-primary-600 text-white border-primary-500 rounded-full' : 'bg-white text-gray-800'}"
			>
				{course}
			</button>
			{#if course !== courses[courses.length - 1]}
				<div class="w-px h-5 bg-gray-300 self-center"></div>
			{/if}
		{/each}
	</div>
</div>
