<script lang="ts">
    import {type File, type Publication} from "@prisma/client";
    import type {PageData} from './$types';
    import {DiffBar, getDateDifference, Meta, Tag, TheoryAppBar, lorem, FileTable, Render, Comment} from "$lib";
    import {onMount} from "svelte";
    import Icon from "@iconify/svelte";

    export let data: PageData;

    let publication: Publication = data.publication;

    let liked: boolean = true;
    let saved: boolean = true;
    $:likedColor = liked ? 'text-secondary-500' : 'text-surface-500';
    $:savedColor = saved ? 'text-secondary-500' : 'text-surface-500';
    const toggleLike = () => liked = !liked;
    const toggleSave = () => saved = !saved;

    let tags: string[] = ['Very Big Tag', 'nsnsngrfnfgdb', 'One More ', 'short'];

    let created: string;
    $:created = getDateDifference(publication.createdAt, new Date())

    onMount(() => {
        created = getDateDifference(publication.createdAt, new Date())
    })

    let files = [
        {
            path: "slides.pdf",
            title: "slides.pdf",
            materialId: 1
        },{
            path: "slide.pptx",
            title: "slide.pptx",
            materialId: 1
        },{
            path: "code.py",
            title: "code.py",
            materialId: 1
        },{
            path: "README.md",
            title: "README.md",
            materialId: 1
        }
    ]

    let activeFile:File = files[0];

    let comments = [
        {
            id: 1,
            content: "This is a comment",
            publicationId: 1,
            userId: 1,
            likes: 0,
            updatedAt: new Date(),
            createdAt: new Date()
        },
        {
            id: 1,
            content: "This is a comment",
            publicationId: 1,
            userId: 1,
            likes: 0,
            updatedAt: new Date(),
            createdAt: new Date()
        }
    ]

</script>

<Meta title={publication.title} description="CAIT" type="site"/>

<div class="col-span-full flex flex-col items-start my-20">
    <h2 class="text-lg md:text-xl lg:text-2xl xl:text-3xl font-semibold">{publication.title}</h2>
    <div class="flex gap-2">
        <p class="text-sm text-surface-500">{created}</p>
        <Icon icon="mdi:presentation" class="text-xl text-surface-500"/>
        <DiffBar diff="easy" className="w-4 h-4"/>
    </div>
    <div class="flex flex-wrap gap-2 my-2">
        {#each tags as tag}
            <Tag tagText={tag} removable={false}/>
        {/each}
    </div>
    <p class="text-surface-700 dark:text-surface-400">{lorem + lorem}</p>

    <div class="flex items-center text-3xl rounded-lg border mt-4">
        <button
                class="text-xs flex gap-x-1 items-center px-2 btn rounded-l-lg"
                on:click={() => toggleLike()}>
            <Icon class="text-2xl {likedColor}" icon="material-symbols:star"/>
            <span>472</span>
        </button>
        <button class="flex items-center text-xl btn text-surface-500 px-2 rounded-r-lg">
            <Icon class="xl:text-2xl" icon="material-symbols:download"/>
        </button>
        <button
                class="flex items-center text-xl btn text-surface-500 px-2 rounded-r-lg"
                on:click={() => toggleSave()}>
            <Icon class="xl:text-2xl {savedColor}" icon="ic:baseline-bookmark"/>
        </button>
    </div>
    <div class="w-full flex flex-col-reverse lg:grid gap-8 grid-cols-2 mt-12">
        <div class="flex flex-col row-start-3">
            {#each comments as comment}
                <Comment interaction={comment} popupName="aaa" isReply={false} />
            {/each}
        </div>
        <FileTable {files} bind:activeFile={activeFile} />
        <hr class="row-start-2">
        <Render {activeFile} />
    </div>
</div>