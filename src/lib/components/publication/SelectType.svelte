<script lang="ts">
	const types = ["Video", "Lecture Notes", "Slides", "Assignment", "Exam", "Other"];
	let selectedTypes: string[] = [];

	function selectType(type: string) {
		if (selectedTypes.indexOf(type) > -1) {
			selectedTypes = selectedTypes.filter(t => t !== type);
		} else {
			selectedTypes = [...selectedTypes, type];
		}
	}
</script>

<div class="grid grid-cols-1">
	<div class="flex flex-wrap gap-2">
		{#each types as type}
			<button
				type="button"
				on:click={() => selectType(type)}
				class="px-4 py-2 rounded-full border border-gray-300 text-sm font-medium
					   hover:bg-gray-100 hover:text-black transition
					   {selectedTypes.indexOf(type) > -1 ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-800'}"
			>
				{type}
			</button>
		{/each}
	</div>
</div>
