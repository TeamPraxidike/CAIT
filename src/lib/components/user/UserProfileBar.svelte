<script lang="ts">
    import { page } from '$app/state';
    import type { TUserWithPostsAndProfilePic } from '$lib/database/user';
    import CourseModal from '$lib/components/publication/CourseModal.svelte';

    export let user:TUserWithPostsAndProfilePic;
    if (!user) {
        throw new Error("There was an error with exporting the user data. Please try again.");
    }

    export let userPhotoUrl: string;
    export let tabset: number;

    const numPosts = user.posts.filter((x) => !x.isDraft).length
    const numDrafts = user.posts.filter((x) => x.isDraft).length
    const courses = ["CSE3000"]

    /**
     * Check if the current user is the same as the user being viewed.
     */
    const currentlyAuth = () => page.data.session?.user.id === user.id;

    const defaultProfilePicturePath = "/defaultProfilePic/profile.jpg"
    function openModal() {
        showModal = true;
    }

    function closeModal() {
        showModal = false;
    }


    // const uploadFile
    let showModal = false;
</script>

<div class="col-span-4 flex flex-col items-center gap-2 text-surface-800 rounded-b-lg pb-4 border border-surface-300 border-t-0 self-start
            sm:col-span-4 sm:flex-row sm:px-8 sm:flex-wrap
            md:col-span-8 md:py-8
            lg:col-span-12 lg:px-4
            xl:col-span-3
            dark:bg-surface-800 dark:text-surface-50 dark:border-none">
    <!--{#if userPhotoUrl !== ''}-->
    <!--    <img src={userPhotoUrl} alt="User Profile" class="w-32 h-32 md:w-40 my-4 md:h-40 rounded-full object-cover" />-->
    <!--{:else}-->
    <!--    <div class="w-20 h-20 md:w-40 md:h-40 rounded-full bg-surface-500 placeholder-circle" />-->
    <!--{/if}-->
    <img src={userPhotoUrl ? userPhotoUrl : defaultProfilePicturePath } alt="Profile picture of ${user.username}"
         class="w-32 h-32 md:w-40 my-4 md:h-40 rounded-full object-cover"/>
    <div class="flex px-2 justify-center gap-x-4 gap-y-2 flex-wrap items-center
                sm:flex-col sm:items-start
                md:w-7/12 md:justify-start
                xl:w-full">
        <h2 class="text-lg md:text-xl">{user.firstName} {user.lastName}</h2>

        <div class="hidden md:flex items-start flex-col gap-4 text-surface-700 dark:text-surface-200 ">
            <p class="lg:text-sm 2xl:text-base">Email: {user.email}</p>
            <hr class="w-11/12">

            {#if user.aboutMe !== ''}
                <p class="text-surface-700 text-sm dark:text-surface-400">
                    {user.aboutMe}
                </p>
            {/if}
            <div class="flex gap-2">
                {#if numPosts !== 0}
                    <button class="variant-soft-primary hidden md:block p-2 rounded-lg"
                    on:click={() => tabset = 0}>{numPosts} {numPosts > 1 ? "Publications" : "Publication"}</button>
                {/if}
                {#if currentlyAuth() && numDrafts !== 0}
                    <button class="variant-soft-primary hidden md:block p-2 rounded-lg"
                    on:click={() => tabset=2}>{numDrafts} {numDrafts > 1 ? "Drafts" : "Draft"}</button>
                {/if}
            </div>

            <div class="flex gap-2 flex-wrap">
                {#if currentlyAuth()}
                    <div class="flex gap-2">
                        <a type="button" href="/{user.username}/edit"  class="btn bg-surface-800 text-surface-50 rounded-lg
                           dark:bg-surface-700">Edit Profile</a>
                    </div>
                {/if}
            </div>
            <hr class="w-11/12">

<!--            <div class="flex gap-2 flex-wrap">-->
<!--                {#if currentlyAuth()}-->
<!--                    {#each courses as course}-->
<!--                    <div class="px-4 py-2 rounded-full border border-gray-300 text-sm font-medium-->
<!--					   hover:bg-gray-100 hover:text-black transition">-->
<!--                        {course}-->
<!--                    </div>-->
<!--                        {/each}-->
<!--                    <button class="px-4 py-2 rounded-full border border-gray-300 text-sm font-medium-->
<!--					   hover:bg-gray-100 hover:text-black transition" on:click={openModal}>-->
<!--                        Add Course-->
<!--                    </button>-->
<!--                {/if}-->
<!--            </div>-->
        </div>
    </div>
    <hr class="w-full my-2 md:w-0">

    <!--  VISIBLE ON PHONES   -->
    <div class="px-4 w-full dark:text-surface-200 flex flex-col items-stretch gap-4
                md:hidden">
        <p>Email: {user.email}</p>
        <p class="text-surface-700 dark:text-surface-400">
            {user.aboutMe}
        </p>
        {#if currentlyAuth()}
            <div class="flex gap-4">
                <a type="button" href="./edit" class="btn bg-surface-800 text-surface-50 rounded-lg
                               dark:bg-surface-700">Edit Profile</a>
                <button class="btn bg-surface-800 text-surface-50 rounded-lg
                               dark:bg-surface-700">Settings</button>
            </div>
        {/if}
    </div>

    <div class="flex gap-2">

    </div>
</div>

{#if showModal}
    <CourseModal existingCourse={null} close={closeModal} />
{/if}