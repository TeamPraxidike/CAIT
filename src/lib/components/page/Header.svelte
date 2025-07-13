<script lang="ts">
    import {Grid, UserMenu} from '$lib';
    import { LightSwitch, popup, type PopupSettings } from '@skeletonlabs/skeleton';
    import { page } from "$app/stores";
    import Icon from '@iconify/svelte';
    import { slide } from 'svelte/transition';
    import { quartOut } from 'svelte/easing';
    import type { SupabaseClient } from '@supabase/supabase-js';
    import type { User } from '@prisma/client';

    export let supabase: SupabaseClient;
    export let loggedUser: User & { profilePicData: string }

    type NavOption = {
        text: string;
        link: string;
    }
    const navOptions : NavOption[] = [
        { text: 'Home', link: '/' },
        { text: 'About', link: '/about' },
        { text: 'Browse', link: '/browse?type=materials' },
    ]

    const popupHover: PopupSettings = {
        event: 'click',
        target: 'popupHover',
        placement: 'bottom'
    };

    let dropDown: boolean = false;

    const toggleDropDown = () => dropDown = !dropDown;

    const confirmPublishReset = (event: MouseEvent) => {
        const url = $page.url.pathname;
        if(url.includes('publish/') || url.includes('edit')){
            const confirmation = confirm('Data will be lost. Are you sure you want to proceed?');
            if (!confirmation) {
                event.preventDefault();
                return;
            }

        }
    }
    const handleSignOut = () => {
        const url = $page.url.pathname;
        if(url.includes('publish/') || url.includes('edit')){
            const confirmation = confirm('Data will be lost. Are you sure you want to proceed?');
            if (confirmation) {
                supabase.auth.signOut()
            }
        } else {
            supabase.auth.signOut()
        }
    }

    const defaultProfilePicturePath = "/defaultProfilePic/profile.jpg"

    import { navigating } from '$app/stores'

    let progress = 0;
    let showProgressBar = false;
    let enterEndingInterval = true;
    let progressBarColor = '#00A6D6'
    let progressInterval: any = null;

    const DURATION_MS = 2500;
    const PLACEHOLDER_PROGRESS = 40;

    // // slow it down even further (for heavier fetch operations)
    // $: if (progress === PLACEHOLDER_PROGRESS - 10 && enterEndingInterval) {
    //     clearInterval(progressInterval);
    //
    //     progressInterval = window.setInterval(() => {
    //         progress = Math.min(progress + 1, PLACEHOLDER_PROGRESS);
    //         //console.log(progress);
    //     }, 500);
    // }

    $: if ($navigating && $navigating.complete !== null && !showProgressBar) {
        console.log("in the if")
        showProgressBar = true;
        progress = 0;

        clearInterval(progressInterval);

        progressInterval = window.setInterval(() => {
            progress = Math.min(progress + 1, PLACEHOLDER_PROGRESS);
            //console.log(progress);
        }, DURATION_MS / PLACEHOLDER_PROGRESS);

        $navigating.complete.then(() => {
            clearInterval(progressInterval);
            progressInterval = window.setInterval(() => {
                progress = Math.min(progress + 1, 100);
                //console.log(progress);

                if (progress === 100 && enterEndingInterval) {
                    console.log("prog if")

                    enterEndingInterval = false;

                    // setTimeout(() => {
                    //     clearInterval(progressInterval);
                    // }, 200)

                    clearInterval(progressInterval);

                    progressBarColor = 'transparent';

                    setTimeout(() => {
                        progress = 0;
                    }, 200)

                    setTimeout(() => {
                        progressBarColor = '#00A6D6';
                        showProgressBar = false;
                        enterEndingInterval = true;
                    }, 800);
                }
            }, 3);
            // hide the progress bar after the completion animation (500ms)
        }).catch(() => {
            // if navigation is cancelled or fails, hide the bar immediately.

            enterEndingInterval = false;

            clearInterval(progressInterval);

            progressBarColor = 'transparent';

            setTimeout(() => {
                progress = 0;
            }, 200)

            setTimeout(() => {
                progressBarColor = '#00A6D6';
                showProgressBar = false;
                enterEndingInterval = true;
            }, 800);
        });
    } else {
        console.log("it is null");
        //clearInterval(progressInterval);
    }
</script>

<header class="w-full sticky top-0 z-50 shadow-lg dark:bg-surface-900 bg-surface-50 border-b border-surface-300 dark:border-surface-50 md:border-none overflow-x-hidden">

    <!--{#if showProgressBar}-->
    <!--    <div class="progress-bar-container z-100">-->
    <!--        <div class="progress-bar-meter" style="width: {progress}%"></div>-->
    <!--    </div>-->
    <!--{/if}-->


    <div class="progress-bar-container z-100">
        <div class="progress-bar-meter" style="width: {progress}%; background-color: {progressBarColor};"></div>
    </div>


    <Grid>
        <a href="/" class = "col-start-1" on:click={confirmPublishReset}>
            <enhanced:img class="h-16 w-16" src="/static/images/favicons/favicon-128.png" alt="CAIT Logo"/>
        </a>

        <div class="hidden col-start-2 col-span-7 gap-6 lg:gap-12 items-center md:flex">
            {#each navOptions as opt}
                <a class="group transition text-surface-800 dark:text-surface-50 h-full flex items-center" href={opt.link} on:click={confirmPublishReset}>
                    <span class="bg-left-bottom bg-gradient-to-r from-primary-400 to-primary-400 bg-[length:0%_2px] bg-no-repeat group-hover:bg-[length:100%_2px] transition-all duration-300 ease-in">
                        {opt.text}
                    </span>
                </a>
            {/each}
        </div>

        <div class="hidden md:flex col-start-11 col-span-2 md:gap-2 xl:gap-4 items-center justify-self-end">
            {#if loggedUser}
                <a on:click={confirmPublishReset} href="/publish" class="hidden md:block btn rounded-lg md:py-1 lg:py-1.5 md:px-2 lg:px-3 bg-primary-600 text-surface-50 hover:opacity-60 transition duration-400">
                    Publish
                </a>
            {:else}
                <a href="/signin" class="hidden md:block btn rounded-lg md:py-1 lg:py-1.5 md:px-2 lg:px-3 bg-primary-600 text-surface-50 hover:opacity-60 transition duration-400">
                    Sign In
                </a>
            {/if}
            <div class="border-l border-surface-300 h-8"/>
            <div>
                <LightSwitch />
            </div>

            {#if loggedUser}
                <div class="border-l border-surface-300 h-8"/>
                <div data-testid="profile-picture" use:popup={popupHover} class="cursor-pointer w-8 [&>*]:pointer-events-none">
                    {#if loggedUser}
                        <!--????????-->
                        <!--{#if loggedUser.profilePicData.startsWith("http")}-->
                        <!--    <img class="h-8 w-8 rounded-full object-cover" src={loggedUser.profilePicData} alt={$page.data.session.user.id}/>-->
                        <!--{:else}-->
                        <!--    <img class="h-8 w-8 rounded-full object-cover" src={loggedUser.profilePicData ? `data:image;base64,${loggedUser.profilePicData}` : defaultProfilePicturePath} alt={loggedUser.firstName}/>-->
                        <!--{/if}-->
                        <img class="h-8 w-8 rounded-full object-cover" src={loggedUser.profilePicData
                        ? `data:image;base64,${loggedUser.profilePicData}`
                        : defaultProfilePicturePath} alt={loggedUser.firstName}/>
                    {:else}
                        <div class="w-8 h-8 placeholder-circle" />
                    {/if}
                </div>
                <div data-popup="popupHover">
                    <!-- INNER DIV IS NEEDED TO AVOID STYLING CONFLICTS WITH THE data-popup  -->
                    <UserMenu supabase={supabase} loggedUser={loggedUser} device="desktop" />
                </div>
            {/if}
        </div>

        <button  class="col-end-5 self-center justify-self-end w-12 h-8 md:hidden" on:click={toggleDropDown}>
            <Icon icon="solar:hamburger-menu-outline" className="text-surface-600 dark:text-surface-50" width="48" height="32"/>
        </button>

        {#if dropDown}
            <div class="md:hidden col-span-4 w-full flex flex-col items-stretch" transition:slide={{ delay: 0, duration: 400, easing: quartOut, axis: 'y' }}>
                {#each navOptions as opt}
                    <a class="md:underline text-surface-800" href={opt.link} on:click={toggleDropDown} on:click={confirmPublishReset}>
                        <div class="p-4 rounded-lg flex justify-between  items-center dark:text-surface-50">
                            {opt.text}
                            <Icon icon="oui:arrow-right" className="text-sm text-surface-600"/>

                        </div>
                    </a>
                    <hr class="bg-surface-600 border-0 dark:bg-surface-300 my-2">
                {/each}


                {#if $page.data.session?.user}
                    <!-- INNER DIV IS NEEDED TO AVOID STYLING CONFLICTS WITH THE data-popup  -->
                    <UserMenu supabase={supabase} loggedUser={loggedUser} device="mobile" />
                {/if}

                <div class="flex justify-between p-2 items-center">

                    <div class="flex items-center gap-2">
                        {#if $page.data.session?.user}
                            <a on:click={confirmPublishReset} href="/publish" class="btn rounded-lg md:py-1 lg:py-1.5 md:px-2 lg:px-3 bg-primary-600 text-surface-50 hover:opacity-60 transition duration-400">
                                Publish
                            </a>
                        {/if}
                        <div class="xl:col-start-12">
                            <LightSwitch />
                        </div>
                    </div>


                    {#if $page.data.session?.user}
                        <div class="flex gap-2 items-center">
                            <button on:click={handleSignOut} class="anchor col-start-2">Log out</button>
                        </div>
                    {:else}
                        <a href="/signin" class="btn rounded-lg variant-ghost-primary">
                            Sign In
                        </a>
                    {/if}
                </div>
            </div>
        {/if}
    </Grid>
</header>

<style>
    .progress-bar-container {
        top: 0;
        left: 0;
        right: 0;
        width: 100%;
        height: 3px;
        background-color: transparent;
    }

    .progress-bar-meter {
        height: 100%;
        transition: width 0.2s cubic-bezier(0.25, 1, 0.5, 1);
    }
</style>
