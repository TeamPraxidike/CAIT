<script lang="ts">
    import { Filter, PublicationCard, SearchBar, UserProp } from '$lib';
    import TagComponent from '$lib/components/generic/TagComponent.svelte';
    import {page} from '$app/stores';
    import {fly} from 'svelte/transition';
    import Icon from '@iconify/svelte';
    import type { Material, Publication, User, Tag } from '@prisma/client';
    import type { PageServerData } from './$types';

    export let data:PageServerData;
    let searchWord: string = '';
    let materials = data.publications;
    let users = data.users
    console.log(users)



    $:pageType = data.type;
    $: materialsText = pageType === 'materials' ? 'text-surface-50 dark:text-surface-900' : 'text-primary-500'
    $: peopleText = pageType === 'people' ? 'text-surface-50 dark:text-surface-900' : 'text-primary-500'
    $: circuitsText = pageType === 'circuits' ? 'text-surface-50 dark:text-surface-900' : 'text-primary-500'

    $: materialsBg = pageType === 'materials' ? 'bg-primary-500 dark:bg-primary-600 hover:bg-primary-500 hover:dark:bg-primary-600 hover:text-surface-50 dark:hover:text-surface-900' : 'hover:bg-primary-50 dark:hover:bg-primary-800'
    $: peopleBg = pageType === 'people' ? 'bg-primary-500 dark:bg-primary-600 hover:bg-primary-500 hover:dark:bg-primary-600 hover:text-surface-50 dark:hover:text-surface-900' : 'hover:bg-primary-50 dark:hover:bg-primary-800'
    $: circuitsBg = pageType === 'circuits' ? 'bg-primary-500 dark:bg-primary-600 hover:bg-primary-500 hover:dark:bg-primary-600 hover:text-surface-50 dark:hover:text-surface-900 ' : 'hover:bg-primary-50 dark:hover:bg-primary-800'

    //Variables needed to deal with Sort and Difficulty
    let sortOptions: string[] = ["Most Recent", "Most Liked", "Most Used", "Oldest"]
    let sortByActive = false
    let sortByText = 'Sort By'

    let selectedDiff: {id:number, val:string }[] = []
    let diffOptions: { id: number, val: string }[] = ["Easy", "Medium", "Hard"].map((x: string) => ({ id: 0, val: x }));
    let diffActive = false

    //Variables needed to deal with Tags
    let selectedTags: {id:number, val:string }[] = []; //keeps track of selected tags
    let allTags: {id:number, val:string }[] = ["Mini", "ANN", "CNN", "Something Else", "A very Long tag", "Another One", "Vasko", "is", "the", "best", "I"].map(x => ({id : 0, val : x}));  //array with all the tags MOCK
    let displayTags: {id:number, val:string }[] = allTags; //
    let tagActive = false


    //Variables needed to deal with Publishers
    let selectedPublishers: {id:number, val:string }[] = [];//keeps track of selected tags
    let allPublisherNames: {id:number, val:string }[] = users.map( (x:any) => ({id : x.id, val:(x.firstNname + " " + x.lastName)})); //array with all the tags MOCK
    let displayPublishers: {id:number, val:string }[] = allPublisherNames; //
    let publisherActive = false

    //Variables needed to deal with Types
    let selectedTypes: {id:number, val:string }[] = []; //keeps track of selected tags
    let allTypes: {id:number, val:string }[] = ["Presentation", "Code", "Video", "Assignment", "Dataset", "Exam", "Circuit"].map(x => ({id : 0, val : x})); //array with all the tags MOCK
    let displayTypes: {id:number, val:string }[] = allTypes; //
    let typeActive = false

    $:console.log(selectedTypes, selectedTags, selectedPublishers, selectedDiff)




    //SORT BY Functionality

    //Used to make the dropdown appear/disappear
    const toggleSortBy = () => {
        //If sort by is active just close all the dropdowns else we first need to close down every other dropdown and then dropdown the sort by
        if (!sortByActive) {
            clearAll();
            sortByActive = true;
        } else {
            clearAll();
        }
    };
    //Make the border light blue showing the current toggle is active
    $: sortByBorder = sortByActive ? "border-primary-400" : "border-surface-400"

    //Updates the sortBy text for easier understanding
    const updateSortBy = (event: MouseEvent) => {
        //Take the selected option
        const target = event.target as HTMLButtonElement
        // change the text of the dropdown button
        sortByText = target.textContent ?? "Sort By"
        //close the dropdown upon selection
        sortByActive = false;
    }


    /**
     * Remove tag action called by the X on the line
     *
     */
    const removeTag = (event: CustomEvent) => {
        selectedTags = selectedTags.filter(item => item.val !== event.detail.text)
    }

    const removePublisher = (name: {id:number, val:string }) => {
        selectedPublishers = selectedPublishers.filter(publisher => publisher.val !== name.val);
    };

    const removeDiff = (name:{id:number, val:string }) => {
        selectedDiff = selectedDiff.filter(diff => diff.val !== name.val);
    };

    const removeType = (name: {id:number, val:string }) => {
        selectedTypes = selectedTypes.filter(diff => diff.val !== name.val);
    };

    /**
     * Method that makes all the dropdowns go up; Used so whenever you drop down a menu it closes all others
     */
    const clearAll = () => {
        sortByActive = false;
        diffActive = false;
        tagActive = false;
        publisherActive = false;
        typeActive = false;
    };

    const sendFiltersToAPI = async () => {
        // Construct the URL with query parameters based on selected filters
        const queryParams = new URLSearchParams({
            publishers: selectedPublishers.map(x => x.id).join(','),
            difficulty: selectedDiff.map(x => x.val).join(','),
            types: selectedTypes.map(x => x.val).join(','),
            tags: selectedTags.map(x => x.val).join(',')
        });
        const url = `/api/material?${queryParams.toString()}`;

        // Make a GET request to the API
        await fetch(url)
          .then(response => {
              if (!response.ok) {
                  throw new Error('Network response was not ok');
              }
              return response.json();
          })
          .then(data => {
              // Handle the response data from the API
              materials = data
              console.log(materials)
          })
          .catch(error => {
              console.error('There was a problem with the fetch operation:', error);
          });
    };

</script>

<div class="col-span-4 mt-32">
    <SearchBar searchType="materials" bind:inputKeywords={searchWord}/>
</div>

<div class="col-span-full lg:col-span-8 flex justify-between gap-8 mt-32">
    <div class="flex gap-2">

        <Filter label="Tags" bind:selected={selectedTags} bind:all="{allTags}" bind:display="{displayTags}" profilePic="{false}" bind:active="{tagActive}" on:clearSettings={clearAll}/>
        <Filter label="Publisher" bind:selected={selectedPublishers} bind:all="{allPublisherNames}" bind:display="{displayPublishers}" profilePic="{true}" bind:active="{publisherActive}" on:clearSettings={clearAll}/>
        <Filter label="Difficulty" bind:selected={selectedDiff} bind:all="{diffOptions}" bind:display="{diffOptions}" profilePic="{false}" bind:active="{diffActive}" on:clearSettings={clearAll}/>
        <Filter label="Types" bind:selected={selectedTypes} bind:all="{allTypes}" bind:display="{displayTypes}" profilePic="{false}" bind:active="{typeActive}" on:clearSettings={clearAll}/>


        <form action=""><button on:click={sendFiltersToAPI}>Apply</button></form>
        <!-------SortBy-------->
        <div class="space-y-1 relative">
            <button class=" text-xs rounded-lg border px-2 h-full flex items-center justify-between gap-2 hover:border-primary-400 {sortByBorder}"
                    on:click={toggleSortBy}>
                <span class="flex-grow text-surface-700 dark:text-surface-300">{sortByText}</span>
                {#if sortByActive}
                    <Icon icon="oui:arrow-right" class="text-xs text-surface-600 mt-0.5 transform rotate-90 text"/>
                {:else}
                    <Icon icon="oui:arrow-right" class="text-xs text-surface-600 mt-0.5"/>
                {/if}
            </button>
            {#if sortByActive}
                <div class="absolute left-0 right-0 flex flex-col rounded-lg border border-surface-400 bg-surface-50 min-w-32"
                     transition:fly={{ y: -8, duration: 300 }} style="z-index: 9999;">
                    {#each sortOptions as sopt}
                        <button class="text-xs p-1 rounded-lg hover:bg-primary-50 text-left text-surface-600"
                                on:click={updateSortBy}>{sopt}</button>
                    {/each}
                </div>
            {/if}
        </div>

    </div>


    <div class="rounded-lg flex w-1/3">
        <a href="/browse/?type=materials"
           class="rounded-l-lg text-xs lg:text-sm w-1/3 text-center flex justify-center items-center border-y border-l border-primary-500 dark:border-primary-600   {materialsText} {materialsBg}">Materials</a>
        <a href="/browse/?type=people"
           class="text-xs lg:text-sm w-1/3 text-center flex justify-center items-center border-y border-primary-500 dark:border-primary-600   {peopleText} {peopleBg}">People</a>
        <a href="/browse/?type=circuits"
           class="rounded-r-lg text-xs lg:text-sm w-1/3 flex justify-center items-center border-y border-r border-primary-500 dark:border-primary-600  {circuitsText} {circuitsBg}">Circuits</a>

    </div>
</div>

<div class="col-span-full flex gap-2">
    {#if (selectedTags.length !== 0)}
        <div class=" flex gap-2 items-center">
            <p class="text-xs text-surface-600 dark:text-surface-200">Tags:</p>
            {#each selectedTags as tag}
                <div>
                    <TagComponent tagText="{tag.val}" width="{0}" removable="{true}" on:Remove={removeTag}/>
                </div>
            {/each}
        </div>
    {/if}

    {#if (selectedPublishers.length !== 0)}
        <div class=" flex gap-2 items-center">
            <p class="text-xs text-surface-600 dark:text-surface-200">Publishers:</p>
            {#each selectedPublishers as sp}
                <div class="flex gap-1 items-center">
                    <Icon class="text-surface-600 justify-self-end self-center size-4" icon="gg:profile"/>
                    <p class="text-xs">{sp.val}</p>
                    <button class="h-full" on:click={() => removePublisher(sp)}>
                        <Icon icon="mdi:remove" class="text-surface-600 text-opacity-50 text-sm self-center mt-0.5"/>
                    </button>

                </div>
            {/each}
        </div>
    {/if}

    {#if (selectedDiff.length !== 0)}
        <div class=" flex gap-2 items-center">
            <p class="text-xs text-surface-600 dark:text-surface-200">Difficulty:</p>
            {#each selectedDiff as sd}
                <div class="flex gap-1 items-center">
                    <p class="text-xs">{sd.val}</p>
                    <button class="h-full" on:click={() => removeDiff(sd)}>
                        <Icon icon="mdi:remove" class="text-surface-600 text-opacity-50 text-sm self-center mt-0.5"/>
                    </button>
                </div>
            {/each}
        </div>
    {/if}

{#if (selectedTypes.length !== 0)}
    <div class=" flex gap-2 items-center">
        <p class="text-xs text-surface-600 dark:text-surface-200">Type:</p>
        {#each selectedTypes as sd}
            <div class="flex gap-1 items-center">
                <p class="text-xs">{sd.val}</p>
                <button class="h-full" on:click={() => removeType(sd)}>
                    <Icon icon="mdi:remove" class="text-surface-600 text-opacity-50 text-sm self-center mt-0.5"/>
                </button>
            </div>
        {/each}
    </div>
{/if}
</div>

{#each materials as material}
    <PublicationCard publication={material.publication} />
{/each}


<!--{#await }-->
<!--	-->
<!--{:then } -->
<!--	-->
<!--{/await}-->