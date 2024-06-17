<script lang="ts">


	import { DiffBar, getDateDifference, Tag, UsedInCourse } from '$lib';

	import { goto } from '\$app/navigation';
	import Icon from '@iconify/svelte';
	import { fly } from 'svelte/transition';
	import { createEventDispatcher, onMount } from 'svelte';
	import { type Publication, PublicationType, type User } from '@prisma/client';
	import type { PopupSettings } from '@skeletonlabs/skeleton';
	import { page } from '$app/stores';
	import {
		getModalStore,
		initializeStores,
		Modal,
		type ModalComponent,
		type ModalSettings,
		popup
	} from '@skeletonlabs/skeleton';
    import {IconMapExtension, PublicationTypeIconMap} from '$lib/util/file';
	import { coursesStore } from '$lib/stores/courses';

	export let publication: Publication & {
		tags: { content: string }[],
		usedInCourse: { course: string }[]
	};

	export let publisher: User & { profilePicData: string };

	let popupName = publication.id.toString().concat(publication.title);


	initializeStores();

	const modalStore = getModalStore();

	export let className: string = 'col-span-4 lg:col-span-3 3xl:col-span-2';
	export let liked: boolean = true;
	export let saved: boolean = true;
	export let tags: string[] = publication.tags.map(tag => tag.content);
	export let imgSrc: string;
	export let markAsUsed: boolean = false;
	export let courses: string[] = publication.usedInCourse.map(usedInCourse => usedInCourse.course);

	export let extensions: string[] = [];
	export let materialType: string = "information";
	export let forArrow: boolean = false;



	const userId = $page.data?.session?.user?.id || '0';

	//used to differentiate if it's used in a normal browse or in the circuit browse
	export let inCircuits: boolean = false;
	//Used to see if It's used in circuit whether it is selected for the circuit
	export let selected: boolean = false;
	let lastUpdated: string = getDateDifference(publication.updatedAt, new Date());

	$:likedColor = liked ? 'text-secondary-500' : 'text-surface-500';
	$:savedColor = saved ? 'text-secondary-500' : 'text-surface-500';
	$:used = courses.length;

    let likes = publication.likes;
    const toggleLike = async () => {
        likes = liked ? likes - 1 : likes + 1;
        await fetch(`/api/user/${userId}/liked/${publication.id}`, {
            method: 'POST',
        }).then(() => {
					liked = !liked
					dispatch('liked', { id: publication.id })
				});
    }

    const toggleSave = async () => {
        await fetch(`/api/user/${userId}/saved/${publication.id}`, {
            method: 'POST',
        }).then(() => {
					saved = !saved
					dispatch('saved', { id: publication.id })
				});
    }

	let hoverDiv: HTMLDivElement;
	let container: HTMLDivElement;
	let containerWidth: number = 0;
	let isHovered = false;
	let maxTags = tags.length;
	let tagWidths: number[] = tags.map(() => 0);


	const handleHover = () => isHovered = !isHovered;


	const updateContainerWidth = () => {
		if (container) {
			containerWidth = container.getBoundingClientRect().width;
			maxTags = calcMaxTags();
		}
	};

	/**
	 * Calculates the maximum amounts of tags allowed for the width of the card so that it doesn't overflow with tags
	 * @returns set max amount of tags: number
	 */
	const calcMaxTags = () => {
		let res = 0;
		let currentWidth = 0;

		for (let i = 0; i < tagWidths.length; i++) {
			let checkLast = i === tagWidths.length - 1 ? tagWidths[i] : tagWidths[i] + 24;


			if (!(currentWidth + checkLast <= containerWidth)) {
				break;
			}

			currentWidth += (tagWidths[i]) + 8;
			res++;

		}
		return res;
	};


	onMount(() => {
		containerWidth = container.getBoundingClientRect().width;
		window.addEventListener('resize', updateContainerWidth);

        maxTags = calcMaxTags();
        if (hoverDiv) {
            hoverDiv.addEventListener('mouseenter', handleHover);
            hoverDiv.addEventListener('mouseleave', handleHover);

			return () => {
				hoverDiv.removeEventListener('mouseenter', handleHover);
				hoverDiv.removeEventListener('mouseleave', handleHover);

			};
		}
	});

	const dispatch = createEventDispatcher();
	const select = () => {
		selected = true;
		dispatch('selected', { id: publication.id });
	};
	const remove = () => {
		selected = false;
		dispatch('removed', { id: publication.id });
	};

	let modalRegistry: Record<string, ModalComponent> = {
		// Set a unique modal ID, then pass the component reference
		useInCourseComponent: {
			ref: UsedInCourse,
			props: {
				courses: courses,
				publicationId: publication.id
			}
		}
	};

	const modal: ModalSettings = {
		type: 'component',
		component: 'useInCourseComponent',
		response: () => {
			if ($coursesStore.length !== 0) {
				courses = $coursesStore.filter(x => x.publicationId === publication.id)[0].courses;
				modalRegistry = {
					useInCourseComponent: {
						ref: UsedInCourse,
						props: {
							courses: courses,
							publicationId: publication.id
						}
					}
				};
			}

		}
	};

	const popupClickPubCard: PopupSettings = {
		event: 'click',
		target: popupName,
		placement: 'bottom',
		closeQuery: '#close, #remove'
	};

	let isClickedTags = false;
	const viewTags = () => {
		isClickedTags = !isClickedTags;
		if(isClickedTags){
			setTimeout(()=>{isClickedTags=false},2000);
		}
	}
</script>
<div class="{className} flex items-center">
	{#if forArrow}
		<div class="carrow shadow-lg"/>
	{/if}
	<div class=" w-full  h-[360px] rounded-lg shadow-md bg-surface-50 dark:bg-surface-800 border dark:border-none">
		<div class="w-full relative h-2/5 rounded-t-lg">
			{#if used === 1}
				<p class="absolute mt-2 right-1 text-xs p-1 rounded-md variant-soft-surface bg-surface-100 font-bold">
					Used in {used} course</p>
			{:else if used > 0}
				<p class="absolute mt-2 right-1 text-xs p-1 rounded-md variant-soft-surface bg-surface-100 font-bold">
					Used in {used} courses</p>
			{/if}
			<a href="../{publication.publisherId}/{publication.id}" class="flex-none " >
				<img class="w-full h-full object-cover rounded-t-lg hover:shadow-md" src={imgSrc} alt="" />
			</a>
		</div>
		<div class="flex flex-col justify-between px-2 py-2 w-full h-3/5 border-t border-surface-300 dark:border-surface-700 items-center justify-elements-center">
			<!-- Title and difficulty -->
			<div class="w-full">
				<div class="flex justify-between items-start">
					<a href="{publication.publisherId}/{publication.id}"
						 class="line-clamp-2 font-bold text-surface-700 max-w-[80%] text-sm dark:text-surface-200 self-center hover:text-surface-500"> {publication.title}
					</a>
					<div class="flex gap-2">
						{#if publication.type === PublicationType.Circuit}
							<Icon icon="tabler:binary-tree-2" class="text-xl self-center text-primary-500" />

						{:else}


							<div class="py-1" bind:this={hoverDiv}>
								<Icon icon={PublicationTypeIconMap.get(materialType) || ""} class="text-primary-600 size-5" />
								{#if isHovered}
									<div
										class="absolute mt-2 bg-surface-50 bg-opacity-100 shadow-md p-2 rounded-lg flex gap-2 items-center transition-all duration-300"
										style="z-index: 9999;" transition:fly={{ y: -8, duration: 400 }}>
										{#each extensions as e}
											<Icon icon={IconMapExtension.get(e) || 'vscode-icons:file-type-text'} class="size-5 self-center" />
										{/each}

									</div>
								{/if}

							</div>
							<div class="self-center">
								<DiffBar className="size-5" diff={publication.difficulty}></DiffBar>
							</div>

						{/if}


					</div>
				</div>


				<p class="w-full line-clamp-2 text-xs text-surface-300  dark:text-surface-600">{lastUpdated}</p>


			</div>

			<p class="w-full line-clamp-3 text-xs text-surface-500  dark:text-surface-400">{publication.description}</p>


			<div bind:this={container} class="flex w-full mt-2 gap-1 flex-nowrap overflow-hidden">
				<div class="flex gap-1 relative">
					{#each tags.slice(0, maxTags) as tag, i}
						<Tag bind:width={tagWidths[i]} tagText={tag} removable="{false}"/>
					{/each}
				</div>
					{#if (tags.length > maxTags) }
						<button on:click={viewTags} class="text-sm text-primary-500 hover:underline">+{tags.length - maxTags}</button>
					{/if}
				{#if isClickedTags}
					<div class="absolute ml-48 flex flex-col gap-1 z-[9999] bg-surface-100" transition:fly={{ x:8 , duration: 400 }}>
						{#each tags.slice(maxTags, tags.length) as tag, i}
							<Tag bind:width={tagWidths[i]} tagText={tag} removable="{false}"/>
						{/each}
					</div>
				{/if}
			</div>
			<div class="w-full space-y-2">
				<hr class="opacity-50">
				<div class="w-full flex justify-between">
					<div class="w-full flex justify-left space-x-4">
						{#if !inCircuits}
							<a data-sveltekit-reload href="/{publication.publisherId}/{publication.id}"
							   class="py-1 px-4 bg-surface-700 text-surface-50 rounded-lg hover:bg-opacity-85">View</a>
						{:else if !selected}
							<button type="button" class="py-1 px-4 bg-primary-600 text-surface-50 rounded-lg hover:bg-opacity-85"
											on:click="{select}">Select
							</button>
						{:else}
							<button type="button" class="py-1 px-4 bg-error-500 text-surface-50 rounded-lg hover:bg-opacity-85"
											use:popup={popupClickPubCard}>Remove
							</button>
							<div class="card p-4 max-w-sm" data-popup="{popupName}" style="z-index: 999">
								<div class="flex gap-2">
									<button type="button" id="remove" on:click="{remove}" class="btn variant-filled-error">Confirm</button>
									<button type="button" id="close" class="btn variant-filled bg-surface-600">Go Back</button>
								</div>
								<div class="arrow bg-surface-100-token" />
							</div>
						{/if}

						{#if markAsUsed}
							<button type="button" on:click={() => modalStore.trigger(modal)}>
								<span class="w-full line-clamp-3 text-sm text-surface-500 dark:text-surface-400" >Mark as used in a course</span>
							</button>
						{/if}
					</div>

					<div class="flex gap-1 items-center pr-5">
						<div class="flex items-center bg-surface-50 dark:bg-surface-800 rounded-lg ">
							<button
								type="button"
								class="text-xs flex gap-x-1 items-center h-full w-full px-1 bg-surface-300 bg-opacity-0 hover:bg-opacity-25 rounded-l-lg"
								on:click={() => toggleLike()}>
								<Icon class="text-lg {likedColor}" icon="material-symbols:star"/>
								<span>{likes}</span>
							</button>

							<div class="h-2/3 w-px bg-surface-200"></div>

							<button
								type="button"
								class="flex items-center text-xl text-surface-500 h-full w-full bg-surface-300 bg-opacity-0 hover:bg-opacity-25 rounded-r-lg"
								on:click={() => toggleSave()}>
								<Icon class="text-lg {savedColor}" icon="ic:baseline-bookmark"/>
							</button>
						</div>
							<a href="../{publication.publisherId}" class="flex-none" >
								<img class="w-5 h-5 md:w-6 md:h-6 rounded-full border object-cover"
										 src={'data:image;base64,' + publisher.profilePicData} alt="CAIT Logo" />

							</a>


					</div>
				</div>
			</div>
		</div>
	</div>

	<Modal components={modalRegistry}/>


</div>



<style>
    .carrow {

        border-top: 12px solid transparent;
        border-bottom: 12px solid transparent;
        border-right: 8px solid #DBDBE1;
        /*top: -16px; !* Adjust as needed to position the arrow *!*/
        /*left: 50%; !* Center the arrow horizontally *!*/
        transform: translateX(10%);

    }
</style>

