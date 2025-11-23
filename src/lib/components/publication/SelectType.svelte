<script lang="ts">
	export let types: string[] = ["Video", "Lecture Notes", "Slides", "Assignment", "Exam", "Other"];
	export let selectedTypes: string[] = [];

	// These types are stored with lowercase first letters in the database and here we need them to be capitalized for display
	// This is a really ugly solution, we just capitalize the first letter of each word in selectedTypes when we receive it
	// Feel free to improve it
	for (let i = 0; i < selectedTypes.length; i++) {
		selectedTypes[i] = selectedTypes[i].toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.substring(1)).join(' ');
	}

	function selectType(type: string) {
		if (selectedTypes.indexOf(type) > -1) {
			selectedTypes = [] // remove this if you want to allow multiple selections
			selectedTypes = selectedTypes.filter(t => t !== type);
		} else {
			selectedTypes = [] // remove this if you want to allow multiple selections
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
				class="px-4 py-2 rounded-full border border-gray-300 text-sm leading-5 font-medium
					   hover:bg-gray-100 hover:text-black transition
					   {selectedTypes.indexOf(type) > -1 ? 'border-primary-600 border-2 text-primary-700 bg-primary-50' : 'bg-white text-gray-800'}"
			>
				{type}
			</button>
		{/each}
	</div>
</div>
