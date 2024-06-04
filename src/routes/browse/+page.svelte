<script lang="ts">
    import {Filter, PublicationCard, SearchBar, UserProp} from '$lib';
    import TagComponent from '$lib/components/generic/TagComponent.svelte';
    import { fly } from 'svelte/transition';
    import Icon from '@iconify/svelte';
    import type { PageServerData } from './$types';
    import ToggleComponent from '$lib/components/ToggleComponent.svelte';
    import type { Material, Publication, Tag, File as PrismaFile, Circuit } from '@prisma/client';
    import type { FetchedFileArray } from '$lib/database';
    import { page } from '$app/stores';

    export let data:PageServerData;
    let searchWord: string = '';
    $: materials = data.materials;
    $: circuits = data.circuits

    let users = data.users
    let tags = data.tags
    //let profilePics:FetchedFileArray = data.profilePics;
    let liked = data.liked as number[];
    let saved = data.saved.saved as number[];


    $: pageType = data.type;

    //Variables needed to deal with Sort and Difficulty
        let sortOptions: string[] = ["Most Recent", "Most Liked", "Most Used", "Oldest"]
        let sortByActive = false
        let sortByText = 'Most Recent'

        let selectedDiff: {id:number, content:string }[] = []
        let diffOptions: { id: number, content: string }[] = ["Easy", "Medium", "Hard"].map((x: string) => ({ id: 0, content: x }));
        let diffActive = false

        //Variables needed to deal with Tags
        let selectedTags: {id:number, content:string }[] = []; //keeps track of selected tags
        let allTags: {id: number, content:string }[] = tags.map((x: Tag) => ({ id: 0, content: x.content }));
        let displayTags: {id:number, content:string }[] = allTags;
        let tagActive = false

        //Variables needed to deal with Publishers
        let selectedPublishers: {id:number, content:string }[] = [];//keeps track of selected tags
        let allPublisherNames: {id:number, content:string }[] = users.map( (x:any) => ({id : x.id, content:(x.firstNname + " " + x.lastName)})); //array with all the tags MOCK
        let displayPublishers: {id:number, content:string }[] = allPublisherNames; //
        let publisherActive = false

        //Variables needed to deal with Types
        let selectedTypes: {id:number, content:string }[] = []; //keeps track of selected tags
        let allTypes: {id:number, content:string }[] = ["Presentation", "Code", "Video", "Assignment", "Dataset", "Exam", "Circuit"].map(x => ({id : 0, content : x})); //array with all the tags MOCK
        let displayTypes: {id:number, content:string }[] = allTypes; //
        let typeActive = false

    //Used to make the dropdown appear/disappear
    const toggleSortBy = () => {
        clearAll();        //If sort by is active just close all the dropdowns else we first need to close down every other dropdown and then dropdown the sort by
        if (!sortByActive) {
            sortByActive = true;
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
        applyActive = true;
    }


    /**
     * Remove tag action called by the X on the line
     *
     */
    const removeTag = (event: CustomEvent) => {
        selectedTags = selectedTags.filter(item => item.content !== event.detail.text)
        applyActive = true;
    }

    const removePublisher = (name: {id:number, content:string }) => {
        selectedPublishers = selectedPublishers.filter(publisher => publisher.content !== name.content);
        applyActive = true;

    };

    const removeDiff = (name:{id:number, content:string }) => {
        selectedDiff = selectedDiff.filter(diff => diff.content !== name.content);
        applyActive = true;

    };

    const removeType = (name: {id:number, content:string }) => {
        selectedTypes = selectedTypes.filter(diff => diff.content !== name.content);
        applyActive = true;

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

    const resetAll = () => {
        searchWord = '';
        applyActive = false
        resetFilters();
    };

    // const resetFilterButton = () => {
    //     resetFilters();
    //     sendFiltersToAPI();
    // };

    const resetFilters = () => {
        console.log("In reset filters: " + pageType)
        selectedTags = [];
        selectedTypes = [];
        selectedPublishers = [];
        selectedDiff = [];
        sendFiltersToAPI();
    };

    const onSearch = (event : CustomEvent) => {
        searchWord = event.detail.value.inputKeywords
        sendFiltersToAPI()
    }

    const getFileExtension = (filePath: string): string =>  {
        const index = filePath.lastIndexOf('.');
        return index !== -1 ? filePath.substring(index + 1) : '';
    }

    const getExtensions = (material : Material & {
        publication: Publication & {
            tags: Tag[];
            usedInCourse: {course: string}[]
        }
        files: PrismaFile[]
    }) => (
        material.files.map((f: { title: string; }) => getFileExtension(f.title))
    )


    const sendFiltersToAPI = async () => {
        console.log(pageType)
        applyActive = false;
        const queryParams = new URLSearchParams({
            publishers: selectedPublishers.map(x => x.id).join(','),
            difficulty: selectedDiff.map(x => x.content).join(','),
            types: selectedTypes.map(x => x.content).join(','),
            tags: selectedTags.map(x => x.content).join(','),
            sort: sortByText,
            q: searchWord
        });

        const s = pageType === "materials" ? "material" : "circuit";
        console.log(s)

        const url = `/api/${s}?${queryParams.toString()}`;

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
              if (s === "material") {
                  materials = data.materials;
              } else {
                  circuits = data;
              }
          })
          .catch(error => {
              console.error('There was a problem with the fetch operation:', error);
          });
    };




    let applyActive = false;
    $:applyBackground = applyActive ? 'bg-primary-600  hover:bg-opacity-75' : 'bg-surface-400';
</script>
<div class="flex justify-between col-span-full mt-32">
    <div class = "flex gap-2 w-full lg:w-7/12 xl:w-1/2">
        <SearchBar searchType="materials" bind:inputKeywords={searchWord} on:SearchQuery={onSearch}/>
    </div>

    <div class="hidden rounded-lg lg:flex w-1/4">
        <ToggleComponent page="{true}" bind:pageType={pageType} options={["materials", "people", "circuits"]}
                         labels={["Materials", "People", "Circuits"]}  />
    </div>
</div>

<div class="col-span-full lg:col-span-7 xl:col-span-6 flex lg:justify-between gap-2">
    <div class="flex gap-1 items-center">

        <Filter label="Tags" bind:selected={selectedTags} bind:all="{allTags}" bind:display="{displayTags}"
                profilePic="{false}" bind:active="{tagActive}" on:clearSettings={clearAll}
                on:filterSelected={() => {applyActive = true}} />
        <Filter label="Publisher" bind:selected={selectedPublishers} bind:all="{allPublisherNames}"
                bind:display="{displayPublishers}" profilePic="{true}" bind:active="{publisherActive}"
                on:clearSettings={clearAll} on:filterSelected={() => {applyActive = true}} />
        <Filter label="Difficulty" bind:selected={selectedDiff} bind:all="{diffOptions}" bind:display="{diffOptions}"
                profilePic="{false}" bind:active="{diffActive}" on:clearSettings={clearAll}
                on:filterSelected={() => {applyActive = true}} />
        <Filter label="Types" bind:selected={selectedTypes} bind:all="{allTypes}" bind:display="{displayTypes}"
                profilePic="{false}" bind:active="{typeActive}" on:clearSettings={clearAll}
                on:filterSelected={() => {applyActive = true}} />
        <div class = "w-px h-4/5 bg-surface-600" ></div>
        <div class="space-y-1 relative">
            <button class="text-xs rounded-lg border py-1 px-2 h-full flex items-center justify-between gap-2 hover:border-primary-400 {sortByBorder}"
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
        <button class="rounded-lg text-xs py-1 px-3 text-surface-100 dark:text-surface-800 {applyBackground}"
                on:click={sendFiltersToAPI} disabled="{!applyActive}">Apply
        </button>
    </div>


    <div class="flex rounded-lg lg:hidden w-1/4">
        <ToggleComponent page="{true}" bind:pageType={pageType} options={["materials", "people", "circuits"]}
                         labels={["Materials", "People", "Circuits"]}  />
    </div>
</div>


<div class="col-span-full flex flex-wrap gap-2">
    {#if (selectedTags.length !== 0)}
        <div class=" flex gap-2 items-center">
            <p class="text-xs text-surface-600 dark:text-surface-200">Tags:</p>
            {#each selectedTags as tag}
                <div>
                    <TagComponent tagText="{tag.content}" width="{0}" removable="{true}" on:Remove={removeTag}/>
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
                    <p class="text-xs">{sp.content}</p>
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
                    <p class="text-xs">{sd.content}</p>
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
                <p class="text-xs">{sd.content}</p>
                <button class="h-full" on:click={() => removeType(sd)}>
                    <Icon icon="mdi:remove" class="text-surface-600 text-opacity-50 text-sm self-center mt-0.5"/>
                </button>
            </div>
        {/each}
    </div>
{/if}


    {#if (selectedTypes.length !== 0) || (selectedPublishers.length !== 0) || (selectedDiff.length !== 0) || (selectedTags.length !== 0)}
        <button class="h-full px-2 p-1 text-xs bg-primary-300 rounded-lg text-primary-50 hover:bg-opacity-75"
                on:click={resetFilters}>
            Reset Filters
        </button>
    {/if}
</div>

{#if pageType === "materials"}
    {#each materials as material, i}
        <PublicationCard extensions="{getExtensions(material)}" imgSrc={'data:image;base64,' + material.coverPicData} publication={material.publication} liked={liked.includes(material.publication.id)} saved={saved.includes(material.publication.id)}/>
    {/each}
{:else if pageType === "people"}
    {#each users as person, i}
        <UserProp view="search" posts="{5}"  userPhotoUrl={'data:image;base64,' +  person.profilePicData} role="Maintainer" user={person} />
    {/each}
{:else if pageType === "circuits"}
    {#each circuits as circuit}
        <PublicationCard  publication="{circuit.publication}" imgSrc= {'data:image;base64,' + circuit.coverPicData} />
    {/each}
{/if}
