<script lang="ts">
    import {Grid} from "$lib";
    import { LightSwitch } from '@skeletonlabs/skeleton';
    import Icon from "@iconify/svelte";
    import { slide } from 'svelte/transition';
    import { quartOut } from 'svelte/easing';



    type NavOption = {
        text: string;
        link: string;
    }

    let dropDown: boolean = false;
    let loggedIn: boolean = false;

    const navOptions : NavOption[] = [
        { text: 'About', link: '/about' },
        { text: 'Materials', link: '/materials' },
        { text: 'Circuits', link: '/circuits' },
        { text: 'My Publications', link: '/mypublications' },
        { text: 'Saved Materials', link: '/saved' },


    ]

    function toggleDropDown() : void{
        dropDown = !dropDown
    }

</script>

<header class="w-screen shadow-lg dark:bg-surface-900  bg-surface-50 border-b border-surface-600 dark:border-surface-300 md:border-none">
    <Grid>
        <div class = "col-start-1">
            <enhanced:img class="h-16 w-16 md:hidden" src="/static/favicon.png" alt="CAIT Logo"/>
            <enhanced:img class="h-16 w-16 hidden md:block" src="/static/Logo.webp" alt="CAIT Logo"/>
        </div>

        <div class="hidden col-start-2 col-span-7 gap-2 lg:gap-4 items-center justify-center flex hidden md:flex">
            {#each navOptions as opt}
                <a class=" group transition text-surface-800 dark:text-surface-50 h-full flex items-center justify-center md:px-2 xl:px-4" href={opt.link} >
                    <span class="bg-left-bottom bg-gradient-to-r from-primary-500 to-primary-500 bg-[length:0%_2px] bg-no-repeat group-hover:bg-[length:100%_2px] transition-all duration-300 ease-in flex items-center justify-center">
                        {opt.text}
                    </span>
                </a>
            {/each}
        </div>

        <div class="hidden md:flex col-end-13 col-span-2 md:gap-2 xl:gap-4 items-center justify-self-end">
                {#if loggedIn}
                    <button class="hidden md:block btn rounded-lg md:py-1 lg:py-1.5 md:px-2 lg:px-3  bg-primary-600 text-surface-50 hover:opacity-60 transition duration-400">Publish</button>
                {:else}
                    <button class="hidden md:block btn rounded-lg md:py-1 lg:py-1.5 md:px-2 lg:px-3  bg-primary-600 text-surface-50 hover:opacity-60 transition duration-400">Sign In</button>
                {/if}
            <div class="border-l border-surface-300 h-8"/>
            <div>
                <LightSwitch />
            </div>

            {#if loggedIn}
            <div class="border-l border-surface-300 h-8"/>
            <div>
                <Icon icon="gg:profile" className = "text-surface-600 justify-self-end" width="32" height="32"/>
            </div>
                {/if}
        </div>

        <button  class = "col-end-5 self-center justify-self-end w-12 h-8 md:hidden" on:click={toggleDropDown}>
                <Icon icon="solar:hamburger-menu-outline" className="text-surface-600 dark:text-surface-50" width="48" height="32"/>
            </button>
        {#if dropDown}
            <div class="col-span-4 w-full" transition:slide={{ delay: 0, duration: 400, easing: quartOut, axis: 'y' }}>
                <div class="flex flex-col items-stretch">
                    {#each navOptions as opt}
                        <a class="md:underline text-surface-800" href={opt.link} on:click={toggleDropDown}>
                            <div class="p-4 rounded-lg flex justify-between  items-center dark:text-surface-50">
                            {opt.text}
                             <Icon icon="oui:arrow-right" className="text-sm text-surface-600"/>

                            </div>
                        </a>
                        <hr class="bg-surface-600 border-0 dark:bg-surface-300">
                    {/each}


                    <div class="flex justify-between p-4 items-center">
                        <div class="xl:col-start-12">
                            <LightSwitch />
                        </div>

                        <button class="btn rounded-lg variant-ghost-primary">Sign In</button>
                    </div>
                </div>
            </div>
        {/if}
    </Grid>
</header>