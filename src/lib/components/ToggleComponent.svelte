<script lang="ts">

	import { createEventDispatcher } from 'svelte';

	export let pageType: string;
	export let options: string[];
	export let labels: string[];

	export let page: boolean;
	$: text = (option: string) => {
		return pageType === option ? 'text-surface-50 dark:text-surface-900' : 'text-primary-500';
	};
	$: bg = (option: string) => {
		return pageType === option ? 'bg-primary-500 dark:bg-primary-600 hover:bg-primary-500 hover:dark:bg-primary-600 hover:text-surface-50 dark:hover:text-surface-900 ' : 'hover:bg-primary-50 dark:hover:bg-primary-800';
	};

	const rounding = (i: number) => {
		if (i === 0)
			return 'rounded-l-lg';

		if (i === options.length - 1)
			return 'rounded-r-lg';

		return '';
	};

	const dispatch = createEventDispatcher();
	const resetAll = (i: number) => {

		if(!page)
			pageType = labels[i]
		dispatch('reset', {option: i});
	};

</script>


{#each options as opt,i}

	{#if page}
		<a href="/browse/?type={opt}" on:click={() => resetAll(i)}
			 class="{rounding(i)} text-xs lg:text-sm w-1/3 text-center flex justify-center items-center border-y border-l border-primary-500 dark:border-primary-600 {text(opt)} {bg(opt)}">{labels[i]}</a>
	{:else}
		<button on:click={() => resetAll(i)}
			 class="{rounding(i)} text-xs lg:text-sm w-1/3 text-center flex justify-center items-center border-y border-l border-primary-500 dark:border-primary-600 {text(opt)} {bg(opt)}">{labels[i]}</button>
	{/if}
	{/each}

