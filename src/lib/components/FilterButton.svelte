<script lang="ts">
	import Icon from '@iconify/svelte';
	import { createEventDispatcher } from 'svelte';
	import { page } from '$app/stores';

	export let idValue : {id:string, content:string} ;
	export let row:number;


	export let profilePic : boolean;

	export let label:string;
	export let selectedIds:string [];
	export let selectedVals:string [];

	export let profilePicData: string = '';



	export let display: {id:string, content:string } [];



	$: background = (t: {id:string, content:string}) => {
		if (label === "Publisher")
			return selectedIds.includes(t.id) ? 'font-bold dark:bg-surface-700 bg-surface-200 bg-opacity-75' : 'hover:font-bold';
		else
			return selectedVals.includes(t.content) ? 'font-bold dark:bg-surface-700 bg-surface-200 bg-opacity-75' : 'hover:font-semibold';
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


<button type="button"
	class="w-full h-full flex items-center gap-2 text-xs p-1 text-left dark:text-surface-400 text-surface-800 {roundingMenuItem(row, display.length)} {background(idValue)}"
	on:click={update}>
	{#if profilePic}
		<img src={'data:image;base64,' + profilePicData} alt="userProfile" class="size-6 rounded-full" >
<!--		<Icon class="text-surface-600 justify-self-end self-center size-6" icon="gg:profile" />-->
	{/if}
	<span class="w-full h-full">{idValue.content}</span>
</button>
