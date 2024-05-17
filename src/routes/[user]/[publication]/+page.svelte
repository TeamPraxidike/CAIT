<script lang="ts">
    import {type Publication} from "@prisma/client";
    import type {LayoutServerData} from './$types';
    import { DiffBar, getDateDifference, Meta, Tag, FileTable, Render, Comment} from '$lib';
    import {onMount} from "svelte";
    import Icon from "@iconify/svelte";
    import {enhance} from "$app/forms"
    export let data: LayoutServerData;

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

    let isFocused = false;
    let originalHeight: string

    onMount(() => {
        created = getDateDifference(publication.createdAt, new Date())
    })

    let files:FileList;
    let activeFile: File;
    let leftHeight:number;
    let maxCommentId = 3;

    let replies = [
        {
            id: 1,
            content: "This is a reply",
            publicationId: 1,
            userId: 1,
            likes: 0,
            updatedAt: new Date(),
            createdAt: new Date()
        },
        {
            id: 2,
            content: "This is a very long reply that provides a lot of information that is helpful and positive to the publisher, engaging in a meaningful conversation that sparks innovation in the mind of the reader through its sheer wisdom and expressive genius",
            publicationId: 1,
            userId: 1,
            likes: 0,
            updatedAt: new Date(),
            createdAt: new Date()
        }
    ]

    let comments = [
        {
            id: 1,
            content: "This is a comment",
            publicationId: 1,
            userId: 1,
            likes: 0,
            updatedAt: new Date(),
            createdAt: new Date(),
            replies: replies
        },
        {
            id: 2,
            content: "This is a very long comment that provides a lot of information that is helpful and positive to the publisher, engaging in a meaningful conversation that sparks innovation in the mind of the reader through its sheer wisdom and expressive genius, resulting in ascending to a higher level of clarity about ANNs.",
            publicationId: 1,
            userId: 1,
            likes: 0,
            updatedAt: new Date(),
            createdAt: new Date(),
            replies: replies

        }
    ]

    let commentText = '';
    let textarea:HTMLTextAreaElement;

    function adjustHeight() {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
    }

    function handleFocus() {
        isFocused = true;
    }

    function handleBlur() {
        if (commentText === '') {
            isFocused = false;
        }
    }

    function handleCancel() {
        commentText = '';
        isFocused = false;
        textarea.style.height=originalHeight;
    }
    /*
    adding this method to test for demo mainly, most likely would be a form with post that happens when you click the comment button
     */
    function addComment(){
        let newComment = {
            id: maxCommentId,
            content: commentText,
            publicationId: 1,
            userId: 1,
            likes: 0,
            updatedAt: new Date(),
            createdAt: new Date(),
            replies:[]
        }
        maxCommentId++;
        isFocused=false;
        textarea.style.height=originalHeight;
        comments = [newComment, ...comments];
    }
    function handleDelete(event:CustomEvent){
        const value = event.detail.value;
        if(value.reply){
            comments
        }else{
            comments = comments.filter(comment => comment.id !== value.interaction.id);
        }

    }
    onMount(() => {
        originalHeight = getComputedStyle(textarea).height;
    });

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
    <p class="text-surface-700 dark:text-surface-400">{publication.description}</p>

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
    <div bind:clientHeight={leftHeight} class="w-full flex flex-col-reverse lg:grid gap-8 grid-cols-2 mt-12">
        <div class="flex flex-col row-start-3">

        </div>
        <FileTable download={true} {files} bind:activeFile={activeFile}/>
        <hr class="row-start-2">
        <Render height={leftHeight} {activeFile}/>
    </div>
</div>

<div class="col-span-full flex flex-col mb-1 gap-1">
    <h2 class="text-3xl">Discussion Forum</h2>
    <hr class="col-span-full">
</div>

<div class="flex mb-2 gap-2 col-span-full items-center">
    <enhanced:img class="w-10 md:w-16 rounded-full my-4 border" src="/static/fdr.jpg" alt="CAIT Logo"/>
<!--    <textarea class="flex-grow border-0 border-b border-gray-300 rounded-none p-2 resize-none" placeholder="Enter text here" rows="1"></textarea>-->
    <form use:enhance method="POST" class="flex-grow ">
        <div class="flex-grow pt-2 items-center">
        <textarea
          name="comment"
          bind:this={textarea}
          class="w-full border-0 border-b border-surface-300 resize-none overflow-hidden rounded-lg shadow-primary-500 shadow-sm"
          placeholder="Start a discussion..."
          rows="1"
          bind:value={commentText}
          on:input={adjustHeight}
          on:focus={handleFocus}
          on:blur={handleBlur}></textarea>
            <div class="flex justify-end mt-2 gap-2">
                <button class="variant-soft-surface px-4 py-2 rounded-lg {isFocused ? 'flex' : 'hidden'} hover:variant-filled-surface" type="button" on:click={handleCancel}>Cancel</button>
                <button class="variant-soft-primary px-4 py-2 rounded-lg {isFocused ? 'flex' : 'hidden'} hover:variant-filled-primary mr-2" type="submit" formaction="?/comment" on:click={addComment}>Comment</button>
            </div>
        </div>
    </form>

</div>

{#each comments as comment (comment.id)}
    <Comment on:deleteInteraction={handleDelete} interaction={comment} popupName="comment + {comment.id} + {comment.updatedAt.toDateString()}" isReply={false}/>
    {#each comment.replies as reply (reply.id)}
            <Comment interaction={reply} popupName="reply + {reply.id} + {reply.updatedAt.toDateString()}" isReply={true}/>
    {/each}
{/each}
