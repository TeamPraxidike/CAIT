<script lang="ts">
	import type { Material, Publication, User } from '@prisma/client';
	import { PublicationCard } from '$lib';
	import Icon from '@iconify/svelte';
	import { createEventDispatcher, onMount } from 'svelte';

	export let saved: number[];
	export let liked: number[];

	export let publications: {
		publication: Publication & {
			materials: Material,
			tags: { content: string }[],
			usedInCourse: { course: string }[]
			publisher: User & {
				profilePicData: string
			};
		}
		coverPicData: string
		publisher: User & {
			profilePicData: string
		}
	}[];

	let elemPub: HTMLDivElement;

	function multiColumnLeft(): void {
		let x = elemPub.scrollWidth;
		if (elemPub.scrollLeft !== 0) x = elemPub.scrollLeft - elemPub.clientWidth;
		elemPub.scroll(x, 0);
	}

	function multiColumnRight(): void {
		let x = 0;
		if (elemPub.scrollLeft < elemPub.scrollWidth - elemPub.clientWidth - 1) x = elemPub.scrollLeft + elemPub.clientWidth;
		elemPub.scroll(x, 0);
	}


	const calcAllowedAmount = () => {
		const screenSize = window.matchMedia('(min-width: 1024px)').matches ? 'lg' : window.matchMedia('(min-width: 640px)').matches ? 'md' : 'sm';
		allowedAmount = screenSize === 'lg' ? 4 : screenSize === 'sm' ? 1 : 2;
	};
	let allowedAmount : number;

	onMount(() => {
		calcAllowedAmount();
		window.addEventListener('resize', calcAllowedAmount);
		return () => window.removeEventListener('resize', calcAllowedAmount);
	});

	const likedToggled = (event: CustomEvent) => {

		const id = event.detail.id;
		if (liked.includes(id)) {
			liked = liked.filter((i) => i !== id);
		} else {
			liked.push(id);
		}
	};

	const savedToggled = (event: CustomEvent) => {
		const id = event.detail.id;
		if (saved.includes(id)) {
			saved = saved.filter((i) => i !== id);
		} else {
			saved.push(id);
		}
	};

	const dispatch = createEventDispatcher();

	// Assures currently displayed tab is 0 (materials/circuit)
	const resetTab = () => {
		dispatch('resetTab', { tabValue: 0 });
	};

</script>

{#if allowedAmount < publications.length}
	<div class="grid grid-cols-[auto_1fr_auto] gap-4 items-center">
		<!-- Button: Left -->
		<button type="button" class="btn-icon variant-filled bg-surface-600" on:click={multiColumnLeft}>
			<Icon icon="mingcute:arrow-left-fill" class="size-8" />
		</button>


		<!-- Carousel -->
		<div bind:this={elemPub} class="snap-x snap-mandatory scroll-smooth flex gap-2 pb-2 overflow-x-auto">
			{#each publications as publication (publication.publication.id)}
				<div class="min-w-[100%] max-w-[100%] md:min-w-[48%] md:max-w-[32%] lg:min-w-[24%] lg:max-w-[24%]">
					<PublicationCard publication="{publication.publication}" imgSrc={publication.coverPicData}
													 liked={liked.includes(publication.publication.id)} saved={saved.includes(publication.publication.id)}
													 publisher={publication.publisher}
					on:resetTab={resetTab}/>
				</div>
			{/each}
		</div>
		<!-- Button-Right -->
		<button type="button" class="btn-icon variant-filled bg-surface-600" on:click={multiColumnRight}>
			<Icon icon="mingcute:arrow-right-fill" class="size-8" />
		</button>
	</div>

{:else}
	<div bind:this={elemPub} class="snap-x snap-mandatory scroll-smooth flex gap-2 pb-2 overflow-x-auto">
		{#each publications as publication (publication.publication.id)}
			<div class="min-w-[100%] max-w-[100%] md:min-w-[48%] md:max-w-[32%] xl:min-w-[24%] xl:max-w-[24%]">
				<PublicationCard publication="{publication.publication}" imgSrc={publication.coverPicData}
												 liked={liked.includes(publication.publication.id)} saved={saved.includes(publication.publication.id)}
												 publisher={publication.publisher} on:liked={likedToggled} on:saved={savedToggled}
								 on:resetTab={resetTab}/>
			</div>
		{/each}
	</div>
{/if}
