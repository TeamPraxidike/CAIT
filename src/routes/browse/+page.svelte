<script lang="ts">
    import { Filter, PublicationCard, SearchBar, Tag } from '$lib';
    import { page } from '$app/stores';
    import { fly } from 'svelte/transition';
    import Icon from '@iconify/svelte';


    let searchWord: string = '';
    $:pageType = $page.data.type;

    const detTitle = (s: string): string => {
        if (s === 'circuits')
            return 'Circuits';
        else if (s === 'people')
            return 'People';
        else
            return 'Materials';
    };
    $: title = detTitle(pageType);

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

    let selectedDiff: string[] = []; //keeps track of selected tags
    let allDiff: string[] = ['Easy', 'Moderate', 'Hard'];
    let diffActive = false

    //Variables needed to deal with Tags
    let selectedTags: string[] = []; //keeps track of selected tags
    let allTags: string[] = ["ANN", "CNN", "Something Else", "A very Long tag", "Another One", "Vasko", "is", "the", "best", "I"]; //array with all the tags MOCK
    let displayTags: string[] = allTags; //
    let tagActive = false

    //Variables needed to deal with Publishers
    let selectedPublishers: string[] = []; //keeps track of selected tags
    let allPublisherNames: string[] = ["Winston Churchill", "Franklin D. Roosevelt", "Vasko", "Bog Bezkrak", "Franklin Kostenurkata", "Goti Boti"]; //array with all the tags MOCK
    let displayPublishers: string[] = allPublisherNames; //
    let publisherActive = false

    let selectedTypes: string[] = [];
    let allTypes: string[] = ["Presentation", "Dataset", "Video", "Assignment", "Code"]; //array with all the tags MOCK
    let typeActive = false


    //SORT BY Functionality

    //Used to make the dropdown appear/disappear
    const toggleSortBy = () => {
        //If sort by is active just close all the dropdowns else we first need to close down every other dropdown and then dropdown the sort by
        if (!sortByActive) {
            untoggleEverything();
            sortByActive = true;
        } else {
            untoggleEverything();
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

    //Used to make the dropdown appear/disappear

    const removeTag = (event: CustomEvent) => {
        selectedTags = selectedTags.filter(item => item !== event.detail.text)
    }

    /*
        * Remove publisher action called by the X on the line
     */
    const removePublisher = (name: string) => {
        selectedPublishers = selectedPublishers.filter(publisher => publisher !== name);
    };

    const removeDifficulty = (name: string) => {
        selectedDiff = selectedDiff.filter(diff => diff !== name);
    };

    const removeType = (name: string) => {
        selectedTypes= selectedTypes.filter(type => type !== name);
    };

    /*
    *Method that makes all the dropdowns go up; Used so whenever you dropdown a menu it closes all others
     */
    const untoggleEverything = () => {
        sortByActive = false;
        diffActive = false;
        tagActive = false;
        publisherActive = false;
        typeActive = false;
    };


</script>

<h1 class="col-span-full pt-16 pb-4 text-xl dark:text-surface-100 text-surface-800 font-bold">{title}</h1>

<div class="col-span-4 ">
    <SearchBar searchType="materials" bind:inputKeywords={searchWord}/>
</div>

<div class="col-span-full lg:col-span-8 flex justify-between gap-8">
    <div class="flex gap-2">
        <Filter bind:active="{tagActive}" bind:all="{allTags}" bind:display="{displayTags}" bind:selected="{selectedTags}"
                label="Tags" on:clearSettings={untoggleEverything} profilePic="{false}"></Filter>
        <Filter bind:active="{publisherActive}" bind:all="{allPublisherNames}" bind:display="{displayPublishers}"
                bind:selected="{selectedPublishers}" label="Publishers"
                on:clearSettings={untoggleEverything} profilePic="{true}"></Filter>
        <Filter bind:active="{diffActive}" bind:all="{allDiff}" bind:display="{allDiff}" bind:selected="{selectedDiff}"
                label="Difficulty" on:clearSettings={untoggleEverything} profilePic="{false}"></Filter>
        <Filter bind:active="{typeActive}" bind:all="{allTypes}" bind:display="{allTypes}" bind:selected="{selectedTypes}"
                label="Types" on:clearSettings={untoggleEverything} profilePic="{false}"></Filter>

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
                <div
                  class="absolute min-w-32 left-0 right-0 flex flex-col rounded-lg border border-surface-400 bg-surface-50"
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
                    <Tag tagText="{tag}" width="{0}" removable="{true}" on:Remove={removeTag}/>
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
                    <p class="text-xs">{sp}</p>
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
                    <p class="text-xs">{sd}</p>
                    <button class="h-full" on:click={() => removeDifficulty(sd)}>
                        <Icon icon="mdi:remove" class="text-surface-600 text-opacity-50 text-sm self-center mt-0.5" />
                    </button>
                </div>
            {/each}
        </div>
    {/if}

    {#if (selectedTypes.length !== 0)}
        <div class=" flex gap-2 items-center">
            <p class="text-xs text-surface-600 dark:text-surface-200">Type:</p>
            {#each selectedTypes as tp}
                <div class="flex gap-1 items-center">
                    <p class="text-xs">{tp}</p>
                    <button class="h-full" on:click={() => removeType(tp)}>
                        <Icon icon="mdi:remove" class="text-surface-600 text-opacity-50 text-sm self-center mt-0.5" />
                    </button>
                </div>
            {/each}
        </div>
    {/if}
</div>


<PublicationCard/>
<PublicationCard/>
<PublicationCard/>
<PublicationCard/>
<PublicationCard/>
<PublicationCard/>
<PublicationCard/>
<PublicationCard/>
<PublicationCard/>
<PublicationCard/>