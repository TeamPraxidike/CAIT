<script lang="ts">


    import {authStore, DiffBar, getDateDifference, Tag} from '$lib';

    import Icon from '@iconify/svelte';
    import { fly } from 'svelte/transition';
    import { createEventDispatcher, onMount } from 'svelte';
    import type { Publication } from '@prisma/client';
    import type { PopupSettings } from '@skeletonlabs/skeleton';
    import { popup } from '@skeletonlabs/skeleton';
    import { IconMapExtension } from '$lib/util/file';

    export let publication:Publication & {
        tags: { content: string }[]
    };

    let popupName = publication.id.toString().concat(publication.title);
    const popupClick: PopupSettings = {
        event: 'click',
        target: popupName,
        placement: 'bottom',
        closeQuery: '#close, #remove'
    };


    export let className: string = 'col-span-4 lg:col-span-3';
    export let liked: boolean;
    export let saved: boolean;
    export let extensions: string[] = [];
    export let used: number = 5;
    export let tags: string[] = publication.tags.map(tag => tag.content);
    export let imgSrc: string;
    export let markAsUsed: boolean = false;
    export let isChecked = false;
    console.log(publication)

    export let forArrow: boolean = false;

    const userId = $authStore.user?.id;

    //used to differentiate if its used in a normal browse or in the circuit browse
    export let inCircuits: boolean = false;
    //Used to see if its used in circuit whether it is selected for the circuit
    export let selected: boolean = false;

    let lastUpdated: string = getDateDifference(publication.updatedAt, new Date());

    $:likedColor = liked ? 'text-secondary-500' : 'text-surface-500';
    $:savedColor = saved ? 'text-secondary-500' : 'text-surface-500';

    let likes = publication.likes;
    const toggleLike = async () => {
        likes = liked ? likes - 1 : likes + 1;
        await fetch(`/api/user/${userId}/liked/${publication.id}`, {
            method: 'POST',
        }).then(() => liked = !liked);
    }

    const toggleSave = async () => {
        await fetch(`/api/user/${userId}/saved/${publication.id}`, {
            method: 'POST',
        }).then(() => saved = !saved);
    }

    const toggleUsedInCourse = async () => {
        if (isChecked) {
            used++;
            await fetch(`/api/user/${userId}/use-in-course/${publication.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ courses: ['a'] }),
            });
        } else {
            used--;
            await fetch(`/api/user/${userId}/use-in-course/${publication.id}?courses=["a"]`, {method: "DELETE"});
        }
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

        maxTags = 10;
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


</script>

<div class="{className} flex items-center">
{#if forArrow}
    <div class="carrow shadow-lg"/>
{/if}
    <div class=" w-full  h-[360px] rounded-lg shadow-md bg-surface-100 dark:bg-surface-800 border dark:border-none">
        <div class="w-full relative h-3/6 rounded-t-lg">
            {#if used > 5}
                <p class="fixed mt-2 right-1 text-xs p-1 bg-secondary-500 rounded-md bg-opacity-50 text-surface-700 dark:text-surface-200">
                    Used in {used} courses</p>
            {:else if used > 0}
                <p class="absolute mt-2 right-1 text-xs p-1 rounded-md variant-soft-surface">
                    Used in {used} courses</p>
            {/if}
            <img class="w-full h-full object-cover" src={imgSrc} alt="" />
        </div>
        <div class="flex flex-col justify-between px-2 py-2 w-full h-3/6 border-t border-surface-300 dark:border-surface-700 items-center justify-elements-center">
            <!-- Title and difficulty -->
            <div class="w-full">
                <div class="flex justify-between">
                    <h4
                      class="line-clamp-2 font-bold text-surface-700 max-w-[80%] text-sm dark:text-surface-200 self-center"> {publication.title}</h4>
                    <div class="flex gap-2 self-center">
                        {#if (extensions.length === 1)}
                            <Icon icon={IconMapExtension.get(extensions[0]) || 'vscode-icons:file-type-text'} class="text-primary-600 text-lg"/>
                        {:else if (extensions.length > 1)}
                            <div class="py-1" bind:this={hoverDiv}>
                                <Icon icon="clarity:file-group-solid" class="text-primary-600 text-lg"/>
                                {#if isHovered}
                                    <div
                                      class="absolute  mt-2 bg-surface-50 bg-opacity-100 shadow-md p-2 rounded-lg flex gap-2 items-center transition-all duration-300"
                                      style="z-index: 9999;" transition:fly={{ y: -8, duration: 400 }}>
                                        {#each extensions as e}
                                            <Icon icon={IconMapExtension.get(e) || 'vscode-icons:file-type-text'} class="text-lg self-center" />
                                        {/each}

                                    </div>
                                {/if}
                            </div>

                        {/if}
                        <div class="self-center">
                            <DiffBar diff={publication.difficulty}></DiffBar>
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
                    <div class="w-full flex justify-left space-x-4">
                        {#if !inCircuits}
                            <a href="{publication.publisherId}/{publication.id}"
                               class="py-1 px-4 bg-surface-700 text-surface-50 rounded-lg hover:bg-opacity-85">View</a>
                        {:else if !selected}
                            <button class="py-1 px-4 bg-primary-600 text-surface-50 rounded-lg hover:bg-opacity-85"
                                    on:click="{select}">Select
                            </button>
                        {:else}
                            <button class="py-1 px-4 bg-error-500 text-surface-50 rounded-lg hover:bg-opacity-85"
                                    use:popup={popupClick}>Remove
                            </button>
                            <div class="card p-4 max-w-sm" data-popup="{popupName}" style="z-index: 999">
                                <div class="flex gap-2">
                                    <button id="remove" on:click="{remove}" class="btn variant-filled-error">Confirm</button>
                                    <button id="close" class="btn variant-filled bg-surface-600">Go Back</button>
                                </div>
                                <div class="arrow bg-surface-100-token" />
                            </div>
                        {/if}

                        {#if markAsUsed}
                            <div class="w-full flex justify-center space-x-2">
                                <input type="checkbox" class="py-3 px-3 bg-surface-700 text-surface-600 rounded-full hover:bg-opacity-85" bind:checked={isChecked} on:change={toggleUsedInCourse}>
                                <p class="w-full line-clamp-3 text-sm text-surface-500 dark:text-surface-400" >Mark as used in a course</p>
                            </div>
                        {/if}
                    </div>

                    <div class="flex gap-2">
                        <div class="flex items-center bg-surface-50 dark:bg-surface-800 rounded-lg ">
                            <button
                              class="text-xs flex gap-x-1 items-center h-full w-full px-2 bg-surface-300 bg-opacity-0 hover:bg-opacity-25 rounded-l-lg"
                              on:click={() => toggleLike()}>
                                <Icon class="text-lg {likedColor}" icon="material-symbols:star"/>
                                <span>{likes}</span>
                            </button>

                            <div class="h-2/3 w-px bg-surface-200"></div>

                            <button
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
