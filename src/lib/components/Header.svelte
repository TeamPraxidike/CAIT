<script lang="ts">
    import {authStore, Grid, IconLink, UserPopUp} from "$lib";
    import {LightSwitch, type PopupSettings, popup} from '@skeletonlabs/skeleton';
    import Icon from "@iconify/svelte";
    import { slide } from 'svelte/transition';
    import { quartOut } from 'svelte/easing';

    type NavOption = {
        text: string;
        link: string;
    }
    const navOptions : NavOption[] = [
        { text: 'About', link: '/about' },
    ]

    const popupHover: PopupSettings = {
        event: 'click',
        target: 'popupHover',
        placement: 'bottom'
    };

    let dropDown: boolean = false;
    let loggedIn: boolean;
    $: loggedIn = $authStore.user !== null;

    const toggleDropDown = () => dropDown = !dropDown;

    // TODO: THIS WOULD ACTUALLY BE A CALL TO THE AUTH SERVICE. CURRENTLY IT'S A MOCK CALL TO THE API TO GET FDR
    const login = () => {
        fetch('/api/user/1').then(res => res.json()).then(data => {
            authStore.setAuth(data, 'token');
        }).catch(err => console.error(err));
    };
</script>

<header class="w-screen shadow-lg dark:bg-surface-800  bg-surface-50 border-b border-surface-300 md:border-none">
    <Grid>
        <a href="/" class = "col-start-1">
            <enhanced:img class="h-16 w-16 md:hidden" src="/static/favicon.png" alt="CAIT Logo"/>
            <enhanced:img class="h-16 w-16 hidden md:block" src="/static/Logo.webp" alt="CAIT Logo"/>
        </a>

        <div class="hidden col-start-2 col-span-7 gap-4 lg:gap-8 items-center md:flex">
            {#each navOptions as opt}
                <a class="group transition text-surface-800 dark:text-surface-50 h-full flex items-center" href={opt.link} >
                    <span class="bg-left-bottom bg-gradient-to-r from-primary-400 to-primary-400 bg-[length:0%_2px] bg-no-repeat group-hover:bg-[length:100%_2px] transition-all duration-300 ease-in">
                        {opt.text}
                    </span>
                </a>
            {/each}
        </div>

        <div class="hidden md:flex col-start-11 col-span-2 md:gap-2 xl:gap-4 items-center justify-self-end">
                {#if loggedIn}
                    <button class="hidden md:block btn rounded-lg md:py-1 lg:py-1.5 md:px-2 lg:px-3 bg-primary-600 text-surface-50 hover:opacity-60 transition duration-400">Publish</button>
                {:else}
                    <button on:click={login} class="hidden md:block btn rounded-lg md:py-1 lg:py-1.5 md:px-2 lg:px-3 bg-primary-600 text-surface-50 hover:opacity-60 transition duration-400">Sign In</button>
                {/if}
            <div class="border-l border-surface-300 h-8"/>
            <div>
                <LightSwitch />
            </div>

            {#if loggedIn}
                <div class="border-l border-surface-300 h-8"/>
                <div use:popup={popupHover} class="cursor-pointer w-8 [&>*]:pointer-events-none">
                    <enhanced:img class="h-8 w-8 rounded-full" src="/static/fdr.jpg" alt="Profile Picture"/>
                </div>
                <div data-popup="popupHover">
                    <!-- INNER DIV IS NEEDED TO AVOID STYLING CONFLICTS WITH THE data-popup  -->
                    <UserPopUp />
                </div>
            {/if}
        </div>

        <button  class="col-end-5 self-center justify-self-end w-12 h-8 md:hidden" on:click={toggleDropDown}>
                <Icon icon="solar:hamburger-menu-outline" className="text-surface-600 dark:text-surface-50" width="48" height="32"/>
            </button>

        {#if dropDown}
            <div class="col-span-4 w-full flex flex-col items-stretch" transition:slide={{ delay: 0, duration: 400, easing: quartOut, axis: 'y' }}>
                {#each navOptions as opt}
                    <a class="md:underline text-surface-800" href={opt.link} on:click={toggleDropDown}>
                        <div class="p-4 rounded-lg flex justify-between  items-center dark:text-surface-50">
                        {opt.text}
                         <Icon icon="oui:arrow-right" className="text-sm text-surface-600"/>

                        </div>
                    </a>
                    <hr class="bg-surface-600 border-0 dark:bg-surface-300 my-2">
                {/each}


                {#if loggedIn}
                    <!-- INNER DIV IS NEEDED TO AVOID STYLING CONFLICTS WITH THE data-popup  -->
                    <div class="grid grid-cols-2">
                        <a href="/{$authStore.user?.id}"
                           class="btn justify-start flex gap-2 items-center hover:bg-surface-200 rounded-lg p-1 dark:hover:bg-surface-700 col-span-2">
                            <enhanced:img class="h-16 w-16 rounded-full" src="/static/fdr.jpg" alt="Profile Picture"/>
                            <div class="flex flex-col">
                                <span>{$authStore.user?.firstName}</span>
                                <span class="text-sm">Go to profile</span>
                            </div>
                        </a>
                        <IconLink p="p-4" icon="ion:person-sharp" href="/{$authStore.user?.id}" link="Profile"/>
                        <IconLink p="p-4" icon="ion:bookmark-sharp" href="/{$authStore.user?.id}/saved" link="Saved"/>
                        <IconLink p="p-4" icon="ion:book" href="/{$authStore.user?.id}/publication" link="Publications"/>
                        <IconLink p="p-4" icon="ion:settings-sharp" href="/settings" link="Settings"/>
                    </div>
                {/if}

                <div class="flex justify-between p-4 items-center">
                    <div class="xl:col-start-12">
                        <LightSwitch />
                    </div>

                    {#if loggedIn}
                        <div use:popup={popupHover} class="cursor-pointer w-8 [&>*]:pointer-events-none">
                            <enhanced:img class="h-8 w-8 rounded-full" src="/static/fdr.jpg" alt="Profile Picture"/>
                        </div>
                    {:else}
                        <button on:click={login} class="btn rounded-lg variant-ghost-primary">Sign In</button>
                    {/if}
                </div>
            </div>
        {/if}
    </Grid>
</header>