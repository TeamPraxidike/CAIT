<script lang="ts">
    import type {User} from "@prisma/client";
    import {authStore} from "$lib";

    export let user:User;
    export let userPhotoUrl: string;
    let about = "Franklin Delano Roosevelt[a] (January 30, 1882 – April 12, 1945), commonly known by his initials FDR, was an American statesman and politician who served as the 32nd president of the United States from 1933 until his death in 1945. He was a member of the Democratic Party and is the only U.S. president to have served more than two terms."


    /**
     * Check if the current user is the same as the user being viewed.
     */
    const currentlyAuth = () => $authStore.user?.id === user.id;
</script>

<div class="col-span-4 flex flex-col items-center gap-2 text-surface-800 rounded-b-lg pb-4 border border-surface-300 border-t-0 self-start
            sm:col-span-4 sm:flex-row sm:px-8 sm:flex-wrap
            md:col-span-8 md:py-8
            lg:col-span-12 lg:px-4
            xl:col-span-3
            dark:bg-surface-800 dark:text-surface-50 dark:border-none">
<!--    <enhanced:img class="w-40 md:w-64 xl:w-full rounded-full my-4 border" src="/static/fdr.jpg" alt="CAIT Logo"/>-->
    {#if userPhotoUrl !== ''}
        <img src={userPhotoUrl} alt="User Profile" class="w-10 h-10 md:w-20 md:h-20 rounded-full" />
    {:else}
        <div class="w-10 h-10 md:w-20 md:h-20 bg-surface-500 placeholder-circle" />
    {/if}
    <div class="flex px-2 justify-center gap-x-4 gap-y-2 flex-wrap items-center
                sm:flex-col sm:items-start
                md:w-7/12 md:justify-start
                xl:w-full">
        <h2 class="text-lg md:text-xl">{user.firstName} {user.lastName}</h2>
        <p class="variant-soft-primary md:hidden p-2 rounded-lg">Reputation: {user.reputation}</p>

        <div class="hidden md:flex items-start flex-col gap-4 text-surface-700 dark:text-surface-200 ">
            <p class="lg:text-sm 2xl:text-base">Email: {user.email}</p>
            <hr class="w-11/12">
            <p class="text-surface-700 text-sm dark:text-surface-400">
                {about}
            </p>
            <div class="flex gap-2 flex-wrap">
                <p class="variant-soft-primary hidden md:block p-2 rounded-lg">Reputation: {user.reputation}</p>
                {#if currentlyAuth()}
                    <div class="flex gap-2">
                        <button class="btn bg-surface-800 text-surface-50 rounded-lg
                           dark:bg-surface-700">Edit Profile</button>
                        <button class="btn bg-surface-800 text-surface-50 rounded-lg
                           dark:bg-surface-700">Settings</button>
                    </div>
                {/if}
            </div>
        </div>
    </div>
    <hr class="w-full my-2 md:w-0">

    <!--  VISIBLE ON PHONES   -->
    <div class="px-4 w-full dark:text-surface-200 flex flex-col items-stretch gap-4
                md:hidden">
        <p>Email: {user.email}</p>
        <p class="text-surface-700 dark:text-surface-400">
            {about}
        </p>
        {#if currentlyAuth()}
            <div class="flex gap-4">
                <button class="btn bg-surface-800 text-surface-50 rounded-lg
                               dark:bg-surface-700">Edit Profile</button>
                <button class="btn bg-surface-800 text-surface-50 rounded-lg
                               dark:bg-surface-700">Settings</button>
            </div>
        {/if}
    </div>

    <div class="flex gap-2">

    </div>
</div>