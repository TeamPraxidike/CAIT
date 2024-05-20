<script lang="ts">
	import Icon from '@iconify/svelte';
	import { createEventDispatcher } from 'svelte';

	export let idValue : {id:number, content:string} ;
	export let row:number;


	export let profilePic : boolean;

	export let label:string;
	export let selectedIds:number [];
	export let selectedVals:string [];




	export let display: {id:number, content:string } [];



	$: background = (t: {id:number, content:string}) => {
		if (label === "Publisher")
			return selectedIds.includes(t.id) ? 'bg-primary-100 hover:bg-primary-100' : 'hover:bg-primary-50';
		else
			return selectedVals.includes(t.content) ? 'bg-primary-100 hover:bg-primary-100' : 'hover:bg-primary-50';
	} //colors in light blue if the tag is already selected in the dropdown


	$: roundingMenuItem = (i: number, arrL: number) => {
		if (i === (arrL - 1))
			return 'rounded-b-lg';
		else if (i === 0 && !profilePic) {
			return 'rounded-t-lg';
		}
		return '';
	};

	const dispatch = createEventDispatcher()

	const update = () => {
		dispatch("update", {idval : idValue})
	}
</script>


<button
	class="w-full h-full flex items-center gap-2 text-xs p-1 text-left text-surface-600 {roundingMenuItem(row, display.length)} {background(idValue)}"
	on:click={update}>
	{#if profilePic}
		<Icon class="text-surface-600 justify-self-end self-center size-6" icon="gg:profile" />
	{/if}
	<span class="w-full h-full">{idValue.content}</span>
</button>
