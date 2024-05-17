<script lang="ts">

    import {DiffBar, getDateDifference, Tag} from '$lib';

    import Icon from '@iconify/svelte';
    import {fly} from 'svelte/transition';
    import {onMount} from 'svelte';
    import type { Publication } from '@prisma/client';
    export let publication:Publication;
    export let className: string = 'col-span-4 lg:col-span-3';
    export let liked: boolean = true;
    export let saved: boolean = true;
    export let numMaterials: number = 1;
    export let used: number = 1;
    export let tags: string[] = ['Very Big Tag', 'nsnsngrfnfgdb', 'One More ', 'short'];

    let lastUpdated: string = getDateDifference(publication.updatedAt, new Date());

    $:likedColor = liked ? 'text-secondary-500' : 'text-surface-500';
    $:savedColor = saved ? 'text-secondary-500' : 'text-surface-500';

    let star: Icon;
    let bookmark: HTMLButtonElement;
    const toggleLike = () => liked = !liked;
    const toggleSave = () => saved = !saved;

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

    /*
    * calculates the maximum amounts of tags allowed for the width of the card so that it doesn't overflow with tags
    * returns set max amount of tags: number
     */
    const calcMaxTags = () => {
        //set vars to keep track of the result and current width of the tags we have already allowed
        let res = 0;
        let currentWidth = 0;

        for (let i = 0; i < tagWidths.length; i++) {
            //We check if the tag is last in order: If it is not we need to accommodate for the potential
            //pixels that +remainingTags will generate in the component later
            let checkLast = i === tagWidths.length - 1 ? tagWidths[i] : tagWidths[i] + 24;


            //Check if adding the next tag would cause an overflow in the width and add it only if that's the case
            if (!(currentWidth + checkLast <= containerWidth)) {
                break;
            }
            //update width and res

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

</script>


<div class="{className} h-[360px] rounded-lg shadow-md bg-surface-100 dark:bg-surface-800 border dark:border-none">
    <div class="w-full relative h-2/5 rounded-t-lg">
        {#if used > 5}
            <p class="fixed mt-2 right-1 text-xs p-1 bg-secondary-500 rounded-md bg-opacity-50 text-surface-700 dark:text-surface-200">
                Used in {used} courses</p>
        {:else if used > 0}
            <p class="absolute mt-2 right-1 text-xs p-1 rounded-md variant-soft-surface">
                Used in {used} courses</p>
        {/if}
    </div>
    <div class="flex flex-col justify-between px-2 py-2 w-full h-3/5 border-t border-surface-300 dark:border-surface-700 items-center justify-elements-center">
        <!-- Title and difficulty -->
        <div class="w-full">
            <div class="flex justify-between">
                <h4
                        class="line-clamp-2 font-bold text-surface-700 max-w-[80%] text-sm dark:text-surface-200 self-center"> {publication.title}</h4>
                <div class="flex gap-2 self-center">
                    {#if (numMaterials === 1)}
                        <Icon icon="mdi:presentation" class="text-primary-600 text-lg"/>
                    {:else}
                        <div class="py-1" bind:this={hoverDiv}>
                            <Icon icon="clarity:file-group-solid" class="text-primary-600 text-lg"/>
                            {#if isHovered}
                                <div
                                        class="absolute  mt-2 bg-surface-50 bg-opacity-100 shadow-md p-2 rounded-lg flex gap-2 items-center transition-all duration-300"
                                        style="z-index: 9999;" transition:fly={{ y: -8, duration: 400 }}>
                                    <Icon icon="mdi:presentation" class="text-primary-600 text-lg self-center"/>
                                    <Icon icon="mdi:presentation" class="text-primary-600 text-lg self-center"/>
                                    <Icon icon="mdi:presentation" class="text-primary-600 text-lg self-center"/>

                                </div>
                            {/if}
                        </div>

                    {/if}
                    <div class="self-center">
                        <DiffBar diff={"hard"}></DiffBar>
                    </div>
                </div>
            </div>


            <p class="w-full line-clamp-2 text-xs text-surface-300  dark:text-surface-600">{lastUpdated}</p>


        </div>

        <p class="w-full line-clamp-3 text-xs text-surface-500  dark:text-surface-400">{publication.description}</p>


        <div bind:this={container} class="flex w-full mt-2 gap-1 flex-nowrap overflow-hidden">
            <div class="flex gap-1">
                {#each tags.slice(0, maxTags) as tag, i}
                    <Tag bind:width={tagWidths[i]} tagText={tag} removable="{false}"/>
                {/each}
            </div>
            <div class=" self-center">
                {#if (tags.length > maxTags)}
                    <p class="text-sm text-primary-500">+{tags.length - maxTags}</p>
                {/if}
            </div>
        </div>
        <div class="w-full space-y-2">
            <hr class="opacity-50">
            <div class="w-full flex justify-between">
                <a href="{publication.publisherId}/{publication.id}" class="py-1 px-4 bg-surface-700 text-surface-50 rounded-lg hover:bg-opacity-85">View</a>
                <div class="flex gap-2">
                    <div class="flex items-center bg-surface-50 dark:bg-surface-800 rounded-lg ">
                        <button
                                class="text-xs flex gap-x-1 items-center h-full w-full px-2 bg-surface-300 bg-opacity-0 hover:bg-opacity-25 rounded-l-lg"
                                on:click={() => toggleLike()}>
                            <Icon bind:this={star} class="text-lg {likedColor}" icon="material-symbols:star"/>
                            <span>{publication.likes}</span>
                        </button>

                        <div class="h-2/3 w-px bg-surface-200"></div>

                        <button bind:this={bookmark}
                                class="flex items-center text-xl text-surface-500 h-full w-full px-2 bg-surface-300 bg-opacity-0 hover:bg-opacity-25 rounded-r-lg"
                                on:click={() => toggleSave()}>
                            <Icon class="text-lg {savedColor}" icon="ic:baseline-bookmark"/>
                        </button>
                    </div>

                    <Icon class="text-surface-600 justify-self-end self-center size-6" icon="gg:profile"/>
                </div>
            </div>
        </div>
    </div>
</div>
