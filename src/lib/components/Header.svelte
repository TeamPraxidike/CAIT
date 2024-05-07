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



    // function closeDropdown(){
    //     dropDown = false
    // }
</script>

<header class="w-screen dark:bg-surface-900 bg-surface-50 border-b border-surface-600 dark:border-surface-300">
    <Grid>
        <img class="col-start-1 h-16 w-16" src=favicon.png alt="CAIT Logo"/>
            <button  class = "col-end-5 self-center justify-self-end w-12 h-8 " on:click={toggleDropDown}>
                <Icon icon="solar:hamburger-menu-outline" className="text-surface-600 dark:text-surface-50" width="48" height="32"/>
            </button>
        {#if dropDown}
            <div class="col-span-4 w-full" transition:slide={{ delay: 0, duration: 400, easing: quartOut, axis: 'y' }}>
                <div class="flex flex-col md:gap-4 items-stretch">
                    {#each navOptions as opt}
                        <a class="md:underline text-surface-800" href={opt.link}>
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