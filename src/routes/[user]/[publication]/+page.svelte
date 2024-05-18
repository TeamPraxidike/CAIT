<script lang="ts">
    import type {LayoutServerData} from './$types';
    import { DiffBar, getDateDifference, Meta, Tag, FileTable, Render, Comment} from '$lib';
    import {onMount} from "svelte";
    import Icon from "@iconify/svelte";
    import {enhance} from "$app/forms"

    /**
     * Preface: load the data from the server
     */
    export let data: LayoutServerData;
    import type { PublicationViewLoad } from './+layout.server';
    let serverData:PublicationViewLoad = data.loadedPublication;

    function createFileList(files: File[]): FileList {
        const fileProperties = files.reduce((acc, _, index) => {
            acc[index] = {
                get() { return files[index] || null }
            };
            return acc;
        }, {} as { [key: number]: { get: () => File | null } });

        return Object.create({
            length: files.length
        }, fileProperties);
    }

    function base64ToFile(base64String: string, filename: string, type: string): File {
        let bstr = atob(base64String);
        let n = bstr.length;
        let u8arr = new Uint8Array(n);

        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }

        return new File([u8arr], filename, {type});
    }

    let files:FileList = createFileList(serverData.fileData.map(fetchedFile => {
        const name = serverData.material.files.find(file => {
            return file.path === fetchedFile.fileId; // Add return statement here
        })?.title || 'Untitled';
        const type  = serverData.material.files.find(file => {
            return file.path === fetchedFile.fileId; // Add return statement here
        })?.type || 'Untitled';

        return base64ToFile(fetchedFile.data, name, type);
    }));

    let activeFile: File;

    let liked: boolean = true;
    let saved: boolean = true;
    $:likedColor = liked ? 'text-secondary-500' : 'text-surface-500';
    $:savedColor = saved ? 'text-secondary-500' : 'text-surface-500';
    const toggleLike = () => liked = !liked;
    const toggleSave = () => saved = !saved;

    let tags: string[] = ['Very Big Tag', 'nsnsngrfnfgdb', 'One More ', 'short'];

    let created: string;
    $:created = getDateDifference(serverData.material.publication.createdAt, new Date())

    let isFocused = false;
    let originalHeight: string

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
        created = getDateDifference(serverData.material.publication.createdAt, new Date())
    });

</script>

<Meta title={serverData.material.publication.title} description="CAIT" type="site"/>

<div class="col-span-full flex flex-col items-start my-20">
    <h2 class="text-lg md:text-xl lg:text-2xl xl:text-3xl font-semibold">{serverData.material.publication.title}</h2>
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
    <p class="text-surface-700 dark:text-surface-400">{serverData.material.publication.description}</p>

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
    <div bind:clientHeight={leftHeight} class="min-h-96 w-full flex flex-col-reverse lg:grid gap-8 grid-cols-2 mt-4">
        <FileTable download={true} {files} bind:activeFile={activeFile}/>
        <Render height={leftHeight} {activeFile}/>
    </div>
</div>

<div class="col-span-full flex flex-col mb-1 gap-1">
    <h2 class="text-3xl">Discussion Forum</h2>
</div>

<div class="flex mb-2 gap-2 col-span-full items-center">
    <enhanced:img class="w-10 md:w-16 rounded-full my-4 border" src="/static/fdr.jpg" alt="CAIT Logo"/>
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
