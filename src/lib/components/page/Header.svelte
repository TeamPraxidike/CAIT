<script lang="ts">
    import {Grid, UserMenu} from '$lib';
    import { LightSwitch, popup, type PopupSettings } from '@skeletonlabs/skeleton';
    import { page } from "$app/stores";
    import Icon from '@iconify/svelte';
    import { slide } from 'svelte/transition';
    import { quartOut } from 'svelte/easing';
    import { signIn, signOut } from '@auth/sveltekit/client';

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
                signOut()
            }
        } else {
            signOut()
        }
    }
</script>

<header class="w-screen shadow-lg dark:bg-surface-900 bg-surface-50 border-b border-surface-300 dark:border-surface-50 md:border-none overflow-x-hidden">
    <Grid>
        <a href="/" class = "col-start-1" on:click={confirmPublishReset}>
            <enhanced:img class="h-16 w-16 md:hidden" src="/static/favicon.png" alt="CAIT Logo"/>
            <enhanced:img class="h-16 w-16 hidden md:block" src="/static/Logo.webp" alt="CAIT Logo"/>
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
            {#if $page.data.session}
                <a on:click={confirmPublishReset} href="/publish" class="hidden md:block btn rounded-lg md:py-1 lg:py-1.5 md:px-2 lg:px-3 bg-primary-600 text-surface-50 hover:opacity-60 transition duration-400">
                    Publish
                </a>
            {:else}
                <button on:click={() => signIn()} type="button" class="hidden md:block btn rounded-lg md:py-1 lg:py-1.5 md:px-2 lg:px-3 bg-primary-600 text-surface-50 hover:opacity-60 transition duration-400">
                    Sign In
                </button>
            {/if}
            <div class="border-l border-surface-300 h-8"/>
            <div>
                <LightSwitch />
            </div>

            {#if $page.data.session}
                <div class="border-l border-surface-300 h-8"/>
                <div data-testid="profile-picture" use:popup={popupHover} class="cursor-pointer w-8 [&>*]:pointer-events-none">
                    {#if $page.data.session}
                        {#if $page.data.session.userPfp.data.startsWith('http')}
                            <img class="h-8 w-8 rounded-full object-cover" src={$page.data.session.userPfp.data} alt={$page.data.session.user.name}/>
                        {:else}
                            <img class="h-8 w-8 rounded-full object-cover" src={'data:image;base64,' + $page.data.session.userPfp.data} alt={$page.data.session.user.name}/>
                        {/if}
                    {:else}
                        <div class="w-8 h-8 placeholder-circle" />
                    {/if}
                </div>
                <div data-popup="popupHover">
                    <!-- INNER DIV IS NEEDED TO AVOID STYLING CONFLICTS WITH THE data-popup  -->
                    <UserMenu device="desktop" />
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


                {#if $page.data.session}
                    <!-- INNER DIV IS NEEDED TO AVOID STYLING CONFLICTS WITH THE data-popup  -->
                    <UserMenu device="mobile" />
                {/if}

                <div class="flex justify-between p-2 items-center">

                    <div class="flex items-center gap-2">
                        {#if $page.data.session}
                            <a on:click={confirmPublishReset} href="/publish" class="btn rounded-lg md:py-1 lg:py-1.5 md:px-2 lg:px-3 bg-primary-600 text-surface-50 hover:opacity-60 transition duration-400">
                                Publish
                            </a>
                        {/if}
                        <div class="xl:col-start-12">
                            <LightSwitch />
                        </div>
                    </div>


                    {#if $page.data.session}
                        <div class="flex gap-2 items-center">
                            <button on:click={handleSignOut} class="anchor col-start-2">Log out</button>
                        </div>
                    {:else}
                        <button on:click={() => signIn()} type="button" class="btn rounded-lg variant-ghost-primary">
                            Sign In
                        </button>
                    {/if}
                </div>
            </div>
        {/if}
    </Grid>
</header>

