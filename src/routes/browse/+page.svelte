<script lang="ts">
    import { Filter, PublicationCard, SearchBar, UserProp } from '$lib';
    import TagComponent from '$lib/components/generic/TagComponent.svelte';
    import Icon from '@iconify/svelte';
    import type { PageServerData } from './$types';
    import ToggleComponent from '$lib/components/ToggleComponent.svelte';
    import type { File as PrismaFile, Material, Publication, Tag } from '@prisma/client';


    //TODO:Redesign Dropdown, Add different filters for users and for circuits, implement filtering for circuits, and users
    //TODO: fix tags on pubCard fix the icon to be the encapsulating type of the publication
    //TODO: add animation on loading
    //TODO: Fix the browsing on other pages as well

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
        let sortOptions: {id:number, content:string }[] = ["Most Recent", "Most Liked", "Most Used", "Oldest"].map(x => ({id:0, content:x}))
        let sortByActive = false
        let sortByText = 'Sort By'

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
        let allPublisherNames: {id:number, content:string }[] = users.map( (x:any) => ({id : x.id, content:(x.firstName + " " + x.lastName)})); //array with all the tags MOCK
        let displayPublishers: {id:number, content:string }[] = allPublisherNames; //
        let publisherActive = false

        //Variables needed to deal with Types
        let selectedTypes: {id:number, content:string }[] = []; //keeps track of selected tags
        let allTypes: {id:number, content:string }[] = ["Presentation", "Information", "Code", "Assignment", "Exam", "Other"].map(x => ({id : 0, content : x})); //array with all the tags MOCK
        let displayTypes: {id:number, content:string }[] = allTypes; //
        let typeActive = false

        let numberNodes : number;



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

    // const resetAll = () => {
    //     searchWord = '';
    //     applyActive = false
    //     rese tFilters();
    // };

    // const resetFilterButton = () => {
    //     resetFilters();
    //     sendFiltersToAPI();
    // };

    const resetFilters = () => {
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

        applyActive = false;
        const queryParams = new URLSearchParams({
            type: pageType
        });

        if (selectedPublishers.length > 0)
        {
            queryParams.set("publishers", selectedPublishers.map(x => x.id).join(','))
        }

        if (selectedDiff.length > 0)
        {
            queryParams.set("difficulty", selectedDiff.map(x => x.content).join(','))
        }
        if (selectedTags.length > 0)
        {
            queryParams.set("tags", selectedTags.map(x => x.content).join(','))
        }
        if (selectedTypes.length > 0)
        {
            queryParams.set("types", selectedTypes.map(x => x.content).join(','))
        }
        if (sortByText !== "Most Recent")
        {
            queryParams.set("sort", sortByText)
        }
        if (searchWord !== "")
        {
            queryParams.set("q", searchWord)
        }
        if (numberNodes != undefined && numberNodes !== 0)
        {
            queryParams.set("limit", numberNodes.toString())
        }


        const s = pageType === "materials" ? "material" : "circuit";
        const url = `/api/${s}?${queryParams.toString()}`;
        materials = [];
        circuits = [];
        //Make a GET request to the API
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
    {#if pageType !== "people"}
        <div class="flex gap-1 items-center">

            <Filter label="Tags" bind:selected={selectedTags} bind:all="{allTags}" bind:display="{displayTags}"
                    profilePic="{false}" bind:active="{tagActive}" on:clearSettings={clearAll}
                    on:filterSelected={() => {applyActive = true}} num="{0}"/>
            <Filter label="Publisher" bind:selected={selectedPublishers} bind:all="{allPublisherNames}"
                    bind:display="{displayPublishers}" profilePic="{true}" bind:active="{publisherActive}"
                    on:clearSettings={clearAll} on:filterSelected={() => {applyActive = true}} num="{0}"/>
            {#if pageType === "materials"}
                <Filter label="Difficulty" bind:selected={selectedDiff} bind:all="{diffOptions}" bind:display="{diffOptions}"
                        profilePic="{false}" bind:active="{diffActive}" on:clearSettings={clearAll}
                        on:filterSelected={() => {applyActive = true}} num="{0}" />
                <Filter label="Types" bind:selected={selectedTypes} bind:all="{allTypes}" bind:display="{displayTypes}"
                        profilePic="{false}" bind:active="{typeActive}" on:clearSettings={clearAll}
                        on:filterSelected={() => {applyActive = true}} num="{0}" />
            {:else}
                <Filter label="Min Num Nodes" selected={[]} all="{[]}" display="{[]}" type="{true}"
                        profilePic="{false}" on:filterSelected={() => {applyActive = true}} bind:active="{diffActive}" on:clearSettings={clearAll} bind:num={numberNodes}/>
            {/if}
            <div class = "w-px h-4/5 bg-surface-600" ></div>
            <Filter label="Sort By" profilePic="{false}" oneAllowed={true} bind:active={sortByActive} bind:selectedOption={sortByText} bind:all={sortOptions} selected={[]} num="{0}" on:clearSettings={clearAll} on:filterSelected={() => {applyActive = true}}/>


            <button class="rounded-lg text-xs py-1.5 px-3 text-surface-100 dark:text-surface-800 shadow-lg {applyBackground}"
                    on:click={sendFiltersToAPI} disabled="{!applyActive}"  >Apply</button>
        </div>
    {/if}


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
        <PublicationCard  publication="{circuit.publication}" imgSrc= {'data:image;base64,' + circuit.coverPicData} liked={liked.includes(circuit.publication.id)} saved={saved.includes(circuit.publication.id)}/>
    {/each}
{/if}
