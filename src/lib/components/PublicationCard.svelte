<script lang="ts">


	import { getDateDifference, Tag } from '$lib';

	import Icon from '@iconify/svelte';
	import { fly } from 'svelte/transition';
	import { createEventDispatcher, onMount } from 'svelte';
	import { type Material, type Publication, PublicationType, type User } from '@prisma/client';
	import type { PopupSettings } from '@skeletonlabs/skeleton';
	import { page } from '$app/state';
	import {
		initializeStores,
		popup
	} from '@skeletonlabs/skeleton';
    import {IconMapExtension, PublicationTypeIconMap} from '$lib/util/file';
	import {typeToHumanString} from "$lib/util/types";
	import LevelIcon from '$lib/components/publication/card/LevelIcon.svelte';
	import BrowseCardShell from './BrowseCardShell.svelte';

	export let publication: Publication & {
		materials : Material
		tags: { content: string }[],
		course: { educationalLevel: string } | null
	};

	export let publisher: User & { profilePicData: string };

	let popupName = publication.id.toString().concat(publication.title);


	initializeStores();

	export let className: string = 'col-span-4 lg:col-span-3 3xl:col-span-2';
	export let liked: boolean = true;
	export let saved: boolean = true;
	export let tags: string[] = publication.tags.map(tag => tag.content);
	export let imgSrc: string | null;

	export let extensions: string[] = [];
	export let materialType: string = "information";
	export const forArrow: boolean = false;

	const userId = page.data?.session?.user?.id || '0';

	//used to differentiate if it's used in a normal browse or in the circuit browse
	export let inCircuits: boolean = false;
	//Used to see if It's used in circuit whether it is selected for the circuit
	export let selected: boolean = false;
	let lastUpdated: string = getDateDifference(publication.updatedAt, new Date());

	$:likedColor = liked ? 'text-secondary-500' : 'text-surface-500';
	$:savedColor = saved ? 'text-secondary-500' : 'text-surface-500';

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


	let isHoveredPfp = false;
	let pfpElement: HTMLDivElement;
	const handlePfpHover = () => isHoveredPfp = !isHoveredPfp;
	onMount(() => {
		containerWidth = container.getBoundingClientRect().width;
		window.addEventListener('resize', updateContainerWidth);

        maxTags = calcMaxTags();
		if (hoverDiv && pfpElement) {
			if (publication.type === PublicationType.Material){
				hoverDiv.addEventListener('mouseenter', handleHover);
				hoverDiv.addEventListener('mouseleave', handleHover);
			}
			pfpElement.addEventListener('mouseenter', handlePfpHover);
			pfpElement.addEventListener('mouseleave', handlePfpHover);
			return () => {
				if (hoverDiv && pfpElement) {
					if (publication.type === PublicationType.Material) {
						hoverDiv.removeEventListener('mouseenter', handleHover);
						hoverDiv.removeEventListener('mouseleave', handleHover);
					}
					pfpElement.removeEventListener('mouseenter', handlePfpHover);
					pfpElement.removeEventListener('mouseleave', handlePfpHover);
				}
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

	// Assures currently displayed tab is 0 (materials/circuit)
	const resetTab = () => {
		dispatch('resetTab', { tabValue: 0 });
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
			setTimeout(()=>{isClickedTags=false},10000);
		}
	}

	const defaultProfilePicturePath = "/defaultProfilePic/profile.jpg"
	const defaultCoverPicturePath = "/defaultCoverPic/assignment.jpg"
</script>


<BrowseCardShell 
	className={className}
	forArrow={false}
	href="../{publisher.username}/{publication.id}"
	onCoverClick={resetTab}
	titleText={publication.title}
	description={publication.description}
	>

	<div slot="badge">
		{#if publication.isDraft}
				<div class="absolute mt-2 right-1 text-xs p-1 rounded-md bg-warning-100 text-warning-700 font-bold">
					<p class="text-sm font-semibold">Draft</p>
				</div>
			{/if}
	</div>

	<img draggable="false" slot="cover" class="w-full h-full object-cover rounded-t-lg hover:shadow-md select-none" src={imgSrc ? imgSrc : defaultCoverPicturePath } alt="" />


	<div slot="icons" class="flex gap-2">
		{#if publication.type === PublicationType.Circuit}
			<Icon
				icon="tabler:binary-tree-2"
				class="text-xl self-center text-primary-500" />
		{:else}
			<div
				class="py-1 relative"
				bind:this={hoverDiv}>
				<Icon
					icon={PublicationTypeIconMap.get(materialType) || ''}
					class="text-primary-600 size-5" />
				{#if isHovered}
					<div
						class="absolute bg-surface-50 dark:bg-surface-800 bg-opacity-100 shadow-md p-2 rounded-lg flex gap-2 items-center transition-all duration-300"
						style="z-index: 9999;"
						transition:fly={{ y: -8, duration: 400 }}>
						<div class="flex flex-col items-center">
							<p class="whitespace-nowrap text-xs">
								{typeToHumanString(materialType)}
							</p>
							<div class="flex flex-row">
								{#each extensions as e}
									<Icon
										icon={IconMapExtension.get(e) ||
											'vscode-icons:file-type-text'}
										class="size-5 self-center" />
								{/each}
							</div>
						</div>
					</div>
				{/if}
			</div>
			<div class="self-center">
				<LevelIcon level={publication.course?.educationalLevel} />
			</div>
		{/if}
	</div>

	<p slot="meta" class="w-full line-clamp-2 text-xs text-surface-600 dark:text-surface-600">{lastUpdated}</p>

	<div slot="tags" bind:this={container} class="flex w-full mt-2 gap-1 flex-nowrap overflow-visible">
		<div class="flex gap-1 relative">
			{#each tags.slice(0, maxTags) as tag, i}
				<Tag bind:width={tagWidths[i]} tagText={tag} removable="{false}"/>
			{/each}
		</div>
			{#if (tags.length > maxTags) }
				<div class="relative overflow-visible">
					<button on:click={viewTags} class="text-sm text-primary-500 hover:underline">+{tags.length - maxTags}</button>
					{#if isClickedTags}
						<div class="absolute rounded-lg p-2 ml-6 mt-[-24px] flex flex-col gap-1 z-[9999] bg-surface-50 dark:bg-surface-800" transition:fly={{ x:8 , duration: 400 }}>
							{#each tags.slice(maxTags, tags.length) as tag, i}
								<Tag bind:width={tagWidths[i]} tagText={tag} removable="{false}"/>
							{/each}
						</div>
					{/if}
				</div>
			{/if}
	</div>
						

	<span slot="interaction-buttons">
		{#if !inCircuits}
							<a href="/{publisher.username}/{publication.id}"
							   class="py-1 px-4 bg-surface-700 text-surface-50 rounded-lg hover:bg-opacity-85"
							   on:click={resetTab}>View</a>
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
	</span>

	<div slot="like-and-save" class="flex items-center bg-surface-50 dark:bg-surface-800 rounded-lg">
		<button
			type="button"
			class="text-xs flex gap-x-1 items-center h-full w-full px-1 bg-surface-300 bg-opacity-0 hover:bg-opacity-25 rounded-l-lg"
			on:click={() => toggleLike()}>
			<Icon class="text-lg {likedColor}" icon="material-symbols:star"/>
			<span>{likes}</span>
		</button>

		<div class="h-2/3 w-px bg-surface-200"></div>

		<button
			type="button" aria-label="Save publication {publication.title}"
			class="flex items-center text-xl text-surface-500 h-full w-full bg-surface-300 bg-opacity-0 hover:bg-opacity-25 rounded-r-lg"
			on:click={() => toggleSave()}>
			<Icon class="text-lg {savedColor}" icon="ic:baseline-bookmark"/>
		</button>
	</div>
	

	<div slot="user-pfp" bind:this={pfpElement} class="relative inline-flex items-center">
		<a href="/{publisher.username}" class="flex-none">
			<img class="w-5 h-5 md:w-6 md:h-6 rounded-full border object-cover"
					src={publisher.profilePicData ? publisher.profilePicData : defaultProfilePicturePath} alt="CAIT Logo" />
		</a>
		{#if isHoveredPfp}
			<div
					class="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-surface-50 dark:bg-surface-800 shadow-md p-2 rounded-lg flex gap-2 items-center"
					style="z-index: 9999;" transition:fly={{ y: 8, duration: 400 }}>

				<div class="flex flex-col items-center">
					<p>{publisher.firstName + " " + publisher.lastName}</p>
				</div>
			</div>
		{/if}
	</div>
</BrowseCardShell>





