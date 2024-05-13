<script lang="ts">
    import type {Comment, Reply} from "@prisma/client";
    import {createEventDispatcher, onMount} from 'svelte';
    import Icon from '@iconify/svelte';
    import type {PopupSettings} from '@skeletonlabs/skeleton';
    import {popup} from '@skeletonlabs/skeleton';
    import {getDateDifference} from "$lib";
    //assuming that you create the comment object prior to creating the components when adding a new comment, having all info available in it
    export let interaction: Comment | Reply;
    export let isReply: boolean;
    export let liked = false;
    //for now, here , we need to fetch it for each comment, which is kind of pain, but sure
    export let userName = "Zlatan Ibrahimovic"
    export let browsingUser = 1
    export let popupName: string;
    let user = interaction.userId
    let text = interaction.content
    let likes = interaction.likes
    let created: string
    let edited = ""
    let isExpanded = false;
    let lineClamp = "line-clamp-3"

    let content: HTMLParagraphElement
    let commentDiv: HTMLDivElement

    let editing = false;
    let newText = '';
    let showConfirmation = false;




    $:lineClamp = isExpanded ? "line-clamp-none" : "line-clamp-2"
    $:created = getDateDifference(interaction.createdAt, new Date())

    const dispatch = createEventDispatcher()
    const handleLike = () => {
        liked = !liked
        likes = liked ? likes + 1 : likes - 1
        dispatch("LikeAction", {
            message: liked ? "User added like" : "User removed like",
            value: {action: likes, userId: user}
        })
    }
    const startEditing = () => {
        editing = true;
        newText = text;
    }

    const saveChanges = () => {
        text = newText;
        editing = false;
        dispatch("EditComment", {value: text})

    }
    const expandAction = () => {
        isExpanded = !isExpanded
    }
    const copyToClipboard = () => {
        navigator.clipboard.writeText(text)
            .then(() => {
                console.log('Text copied to clipboard:', text);
                alert("Successfully copied to clipboard")
                // You can optionally show a success message or perform other actions here
            })
            .catch(err => {
                console.error('Error copying text to clipboard:', err);
                // Handle errors, such as browser support or permission issues
            });
        commentDiv.ariaPressed = "false"
    }
    const handleDelete = () => {
        showConfirmation = true;
    };

    const confirmDelete = () => {
        dispatch(isReply ? 'deleteReply' : 'deleteComment', {value: interaction.id});
        console.log('delete')
        showConfirmation = false;
    };

    const cancelDelete = () => {
        showConfirmation = false;
    };

    onMount(() => {
        created = getDateDifference(interaction.createdAt, new Date())
        if (interaction.updatedAt.getTime() !== interaction.createdAt.getTime())
            edited = "Edited " + getDateDifference(interaction.updatedAt, new Date())
    })
    const popupMenu: PopupSettings = {
        event: 'click',
        target: popupName,
        placement: "right-start",
        middleware: {
            offset: 2
        },
        closeQuery: '#copyButton'
    }

</script>


<div bind:this={commentDiv}
     class="peer/comment {isReply ? 'col-start-2 md:col-start-2 md:col-span-7': 'col-start-1 md:col-start-1 md:col-span-8'} relative rounded-lg flex gap-2 p-1 ">
    <div class="w-12 h-12 placeholder-circle">
    </div>
    <div class="flex flex-col w-full">

        <div class="flex gap-3 items-center">
            <span class="text-surface-800 dark:text-surface-50 font-bold text-l">{userName}</span>
            <span class="text-surface-400 text-sm">{created}</span>
            <button class="[&>*]:pointer-events-none absolute right-0 hover:shadow-lg rounded-lg hover:bg-surface-200 dark:hover:bg-surface-800"
                    use:popup={popupMenu}>
                <Icon icon="ph:dots-three-vertical" style="color: 7F7F94"/>
            </button>
        </div>

        <div class="mb-2 w-full">
            {#if editing}
                <div>
                    <textarea rows="5"
                              class="border-b border-surface-200 border-opacity-50 dark:border-surface-100 dark:border-opacity-50 text-surface-800 text-opacity-90 dark:text-opacity-90 dark:bg-surface-800 dark:text-surface-50 w-full"
                              bind:value={newText}/>
                    <button class="float-right rounded-lg dark:bg-surface-800 hover:bg-surface-300 dark:hover:bg-surface-700 text-surface:700"
                            on:click={saveChanges}>Save
                    </button>
                </div>
            {:else }
                <p bind:this={content}
                   class="text-surface-800 text-opacity-95 dark:text-opacity-95 dark:text-surface-50 mt-2 {lineClamp} text-md">{text}</p>
                <!--{#if truncated}-->
                <button on:click={expandAction} class="hover:underline text-surface-500 text-xs">
                    {isExpanded ? 'Show Less' : 'Show More'}
                </button>
            {/if}

            <!--{/if}-->
        </div>

        <div class="flex items-center gap-5">
            <div class="flex gap-1 items-center">
                <button on:click={handleLike}>
                    {#if liked}
                        <Icon icon="mdi:like" style="color: #00A6D6"/>
                    {:else }
                        <Icon icon="mdi:like-outline" style="color: #7F7F94"/>
                    {/if}
                </button>
                <div class="text-surface-500">{likes}</div>
            </div>

            {#if !isReply}
                <button class="hover:underline text-primary-500">Reply</button>
            {/if}

            <div class="ml-10 text-surface-400 text-sm">{edited}</div>
        </div>

    </div>
</div>

<div data-popup="{popupName}">
    <div class="flex flex-col w-12 gap-2 bg-surface-200 dark:bg-surface-800 dark:text-surface-200 rounded-lg">
        <button id="copyButton" on:click={copyToClipboard}
                class="rounded-lg hover:bg-surface-300 dark:hover:bg-surface-700">
            Copy
        </button>
        <!--		only visible when user is the one who published, don't know how would work yey, just a setup-->
        {#if browsingUser === user}
            <button id="editButton" on:click={startEditing}
                    class="hover:bg-surface-300 dark:hover:bg-surface-700 rounded-lg">
                Edit
            </button>
            <button on:click={handleDelete} id="deleteButton"
                    class="hover:bg-surface-300 dark:hover:bg-surface-700 rounded-lg">
                Delete
            </button>
        {/if}
    </div>
</div>

{#if showConfirmation}
    <div class="z-[9999] fixed inset-0 bg-surface-800 bg-opacity-50 flex justify-center items-center">
        <div class="bg-surface-50 dark:bg-surface-700 dark:text-surface-00 p-8 rounded-lg shadow-lg">
            <p>Are you sure you want to delete this comment?</p>
            <div class="flex justify-center mt-4">
                <button class="mr-4 px-4 py-2 bg-error-500 text-surface-50 rounded-lg" on:click={confirmDelete}>Delete
                </button>
                <button class="px-4 py-2 bg-surface-500 text-surface-200 rounded-lg" on:click={cancelDelete}>Cancel
                </button>
            </div>
        </div>
    </div>
{/if}