<script lang="ts">
    import type { Comment, Reply, User } from '@prisma/client';
    import {createEventDispatcher, onMount} from 'svelte';
    import Icon from '@iconify/svelte';
    import { getModalStore, getToastStore, type PopupSettings } from '@skeletonlabs/skeleton';
    import {popup} from '@skeletonlabs/skeleton';
    import { getDateDifference, AddInteractionForm } from '$lib';

    //assuming that you create the comment object before creating the components when adding a new comment,
    // having all info available in it
    export let interaction: Comment | Reply;
    export let isReply: boolean;
    export let liked:boolean;
    export let photoUrl: string | null;
    export let commenter: User & { profilePicData: string };

    //for now, here, we need to fetch it for each comment, which is kind of pain, but sure
    export let userName = ""
    let browsingUser = commenter.id || 0
    let popupName = isReply ? `reply ${interaction.id} at ${new Date(interaction.createdAt).toDateString()}` : `comment ${interaction.id} at ${new Date(interaction.createdAt).toDateString()}`;
    let user = interaction.userId
    let text = interaction.content
    let likes = interaction.likes
    let created: string
    let edited = ""
    let isExpanded = false;
    let lineClamp = isReply ? "line-clamp-2":"line-clamp-3"

    //let content: HTMLParagraphElement
    let commentDiv: HTMLDivElement

    let editing = false;
    let newText = '';

    $:lineClamp = isExpanded ? "line-clamp-none" : isReply ? "line-clamp-2":"line-clamp-3"
    $:created = getDateDifference(interaction.createdAt, new Date())

    const dispatch = createEventDispatcher()

    const startEditing = () => {
        editing = true;
        newText = text;
    }


    const toastStore = getToastStore();
    const modalStore = getModalStore();


    const expandAction = () => {
        isExpanded = !isExpanded
    }

    const copyToClipboard = () => {
        navigator.clipboard.writeText(text)
            .then(() => {
                toastStore.trigger({
                    message: 'Copied to clipboard',
                    background: 'bg-surface-200'
                });
                // You can optionally show a success message or perform other actions here
            })
            .catch(err => {
                console.error('Error copying text to clipboard:', err);
                // Handle errors, such as browser support or permission issues
            });
        commentDiv.ariaPressed = "false"
    }

    const handleDelete = () => {
        modalStore.trigger({
            type: 'confirm',
            title: 'Delete Comment',
            body: 'Are you sure you want to delete this comment?',
            buttonTextSubmit: 'Delete',
            response: (r: boolean) => {
                if (r) confirmDelete();
            }
        });
    }

    async function confirmDelete () {
        if (isReply){
            try {
                const res = await fetch(`/api/reply/${interaction.id}`, {
                    method: 'DELETE'
                });
                if (res.ok){
                    location.reload();
                }
            } catch (e) {
                console.error(e);
            }
        }
        else{
            try {
                const res = await fetch(`/api/comment/${interaction.id}`, {
                    method: 'DELETE'
                });
                if (res.ok){
                    location.reload();
                }
            } catch (e) {
                console.error(e);
            }
        }
    }

    async function saveChanges() {
        //same as above method for this one
        text = newText;
        editing = false;
        if (isReply){
            try {
                 await fetch(`/api/reply/${interaction.id}`, {
                    method: 'PUT',
                    body: JSON.stringify({content:text})
                })
                //not sure if this should be here
                // setTimeout(() => {
                //     window.location.reload();
                // }, 50);
            } catch (e) {
                console.error(e);
            }
        }
        else{
            try {
                await fetch(`/api/comment/${interaction.id}`, {
                    method: 'PUT',
                    body: JSON.stringify({content:text})
                })
            } catch (e) {
                console.error(e);
            }
        }
    }

    let isDisplayedAdded = false;

    const handleReply = ()=>{
        isDisplayedAdded = true;
    }
    const handleReplyCancel = ()=>{
        isDisplayedAdded = false;
    }
    const sendReplyEvent = (event: CustomEvent) =>{
        dispatch("ReplyAction", event.detail);
        isDisplayedAdded = false;

    }

    /*
    dispatch event to say whether user liked or disliked a comment or reply and save in database
     */
    const handleLike = async () => {
        liked = !liked
        likes = liked ? likes + 1 : likes - 1
        let res: Response;
        if (isReply){
            res = await fetch(`/api/user/${browsingUser}/liked/reply/${interaction.id}`,{
                method: 'POST',
            })
            if (res.ok){
                dispatch('likeUpdate', {like: liked, reply: isReply, id: interaction.id})
            }
        }else{
            res = await fetch(`/api/user/${browsingUser}/liked/comment/${interaction.id}`, {
                method: 'POST',
            })
            if (res.ok){
                dispatch('likeUpdate', {like:liked, reply: isReply, id: interaction.id})
            }
        }

    }

    let display = 'hidden';
    $:display = isDisplayedAdded ? 'flex':'hidden'

    onMount(() => {
        created = getDateDifference(interaction.createdAt, new Date())

        if ((new Date(interaction.updatedAt).getTime() - new Date(interaction.createdAt).getTime() > 10))
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

    const defaultProfilePicturePath = "/static/defaultProfilePic/profile.jpg"
</script>


    <div bind:this={commentDiv}
     class="{isReply ? 'col-start-2 ': 'col-start-1'} col-span-full  rounded-lg flex gap-2 p-1 ">
<!--        <img class="w-10 h-10 md:w-14 md:h-14 rounded-full border" src={'data:image;base64,' + photoUrl} alt="CAIT Logo" />-->
        <img class="w-10 h-10 md:w-14 md:h-14 rounded-full border"
             src={photoUrl ? `data:image;base64,${photoUrl}` : defaultProfilePicturePath}
             alt="Profile Picture" />
        <div class="flex flex-col w-full">

        <div class="flex gap-3 items-center max-w-full">
            <span class="text-surface-800 dark:text-surface-50 font-bold text-l">{userName}</span>
            <span class="text-surface-400 text-sm">{created}</span>


            <button class="[&>*]:pointer-events-none hover:shadow-lg rounded-lg hover:bg-surface-300 dark:hover:bg-surface-800"
                    use:popup={popupMenu}>
                <Icon icon="mdi:dots-vertical" height="24" class="text-surface-900"/>
            </button>
        </div>

        <div class="mb-2 w-full">
            {#if editing}
                <div>
                    <textarea rows="5"
                              class="border-b border-surface-200 border-opacity-50 dark:border-surface-100 dark:border-opacity-50 text-surface-800 text-opacity-90 dark:text-opacity-90 dark:bg-surface-800 dark:text-surface-50 w-full"
                              bind:value={newText} />
                    <button
                      class="btn float-right rounded-lg dark:bg-surface-800 hover:variant-filled-primary dark:hover:bg-surface-700 text-surface:700 variant-soft-primary"
                      on:click={saveChanges}>Save
                    </button>
                </div>
            {:else }
                <p
                  id="commentText"
                  class="text-surface-800 text-opacity-95 dark:text-opacity-95 dark:text-surface-50 {lineClamp} mt-2 text-md w-full break-words">{text}</p>
                    <button on:click={expandAction} class="hover:underline text-surface-500 text-xs">
                        {isExpanded ? 'Show Less' : 'Show More'}
                    </button>
            {/if}
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
                <button class="hover:underline text-primary-500" on:click={handleReply}>Reply</button>
            {/if}

            <div class="ml-10 text-surface-400 text-sm">{edited}</div>
        </div>

    </div>
</div>

<AddInteractionForm publisher={commenter} on:addedReply={sendReplyEvent}  on:cancelEventForum={handleReplyCancel} addComment="{false}" commentId="{interaction.id}" display={display} />

<div data-popup="{popupName}">
    <div class="flex flex-col bg-surface-200 dark:bg-surface-800 dark:text-surface-200 rounded-lg">
        <button id="copyButton" on:click={copyToClipboard}
                class="btn rounded-lg hover:bg-surface-300 dark:hover:bg-surface-700">
            Copy
        </button>
        <!--		only visible when user is the one who published, don't know how would work yey, just a setup-->
        {#if browsingUser === user}
            <button id="editButton" on:click={startEditing}
                    class=" btn hover:bg-surface-300 dark:hover:bg-surface-700 rounded-lg">
                Edit
            </button>
        {/if}
        {#if user === commenter.id || commenter.isAdmin}
            <button on:click={handleDelete} id="deleteButton"
                    class=" btn hover:bg-surface-300 dark:hover:bg-surface-700 rounded-lg">
                Delete
            </button>
        {/if}
    </div>
</div>