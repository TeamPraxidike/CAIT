<script lang="ts">
	import { slide } from "svelte/transition"

	export let title: string = '';
	export let content: string = '';

	let open = false;
</script>

<div role="combobox"
	 aria-controls="dropdown-listbox"
	 aria-expanded={open}
	 aria-haspopup="listbox"
>
	<button
		id="dropdown-button"
		class="text-md w-full bg-surface-200 border px-3 py-2 text-left"
		aria-haspopup="listbox"
		aria-expanded={open}
		on:click={() => open = !open}
		type="button">
		{title}
	</button>
	{#if open}
		<div transition:slide={{ duration: 200 }} class="flex">
			<input
				id="input"
				class="text-md w-full bg-surface-100 border px-3 py-2 text-left"
				type="text"
				bind:value={content}
			/>
		</div>
	{/if}
</div>