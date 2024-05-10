<script lang="ts">

import {DiffBar} from "$lib";

import Icon from "@iconify/svelte";
import { fly } from 'svelte/transition';
import {onMount} from "svelte";
import {Tag} from "$lib"



    export let name:string = "Deatils About CNN and ANN"

    export let liked:boolean = true;
    export let saved:boolean = true;
    export let numMaterials:number = 1
    export let used:number = 1
    export let tags:string[] = ["Very Big Tag", "shit", "nsnsngrfnfgdb", "One More " ]
    //export let tags:string[] = ["tag", "tag", "tag", "tag"]







// const dispatch = createEventDispatcher()
    $:likedColor = liked ? "text-secondary-500" : "text-surface-500"
    $:savedColor = saved ? "text-secondary-500" : "text-surface-500"

    let star:Icon
    let bookmark:HTMLButtonElement
     const toggleLike = () => liked = !liked
     const toggleSave = () => saved = !saved

    let hoverDiv: HTMLDivElement;
    let container : HTMLDivElement;
    let containerWidth:number=0;
    let isHovered = false;
    let maxTags = 2
    let tagWidths: number[] = tags.map(() => 0)


    // $:if (hoverDiv && popupDiv)
    //        translateHover =  hoverDiv.getBoundingClientRect().width/2-popupDiv.getBoundingClientRect().width/2

    const handleHover = () => isHovered = !isHovered;


$: maxTags = calcMaxTags()
    // const updateContainerWidth = () => {
    //     containerWidth = container.getBoundingClientRect().width;
    //     maxTags = calcMaxTags();
    //
    // };

    const calcMaxTags = () => {
        let res = 0
        let currentWidth = 0
        console.log(tagWidths)
        let curWidths = tagWidths.map(x => x+8)
        console.log(curWidths)

        for (let i = 0; i<tagWidths.length; i++)
        {
            if (currentWidth + tagWidths[i] <= containerWidth)
            {
                currentWidth+=(tagWidths[i])
                res++
            }

            else {
                break
            }
        }

        console.log("Data")
        console.log(currentWidth)
        console.log(containerWidth)
        console.log(res)

        return res
    }



    onMount(() => {
        containerWidth = container.getBoundingClientRect().width
        //window.addEventListener('resize', updateContainerWidth);

        maxTags = calcMaxTags()
        if(hoverDiv){
            hoverDiv.addEventListener('mouseenter', handleHover);
            hoverDiv.addEventListener('mouseleave', handleHover);
            //translateHover = hoverDiv.getBoundingClientRect().width/2-popupDiv.getBoundingClientRect().width/2
            //translateHover = (hoverDiv.getBoundingClientRect().right-hoverDiv.getBoundingClientRect().left)/2 + hoverDiv.offsetLeft - ((popupDiv.getBoundingClientRect().right-popupDiv.getBoundingClientRect().left)/2)

            return () => {
                hoverDiv.removeEventListener('mouseenter', handleHover);
                hoverDiv.removeEventListener('mouseleave', handleHover);
                //window.removeEventListener('resize', updateContainerWidth);

            };}

    });

</script>



    <div class="col-span-4 md:col-span-3 h-[360px] rounded-lg shadow-md ">
        <div class="w-full relative h-2/5 rounded-t-lg">
            {#if used>5}
                <p class=" absolute mt-2 right-1 text-xs p-1 bg-secondary-500 rounded-lg bg-opacity-50 text-surface-700 dark:text-surface-200">Used in {used} courses</p>
            {:else if used > 0}
                <p class=" absolute mt-2 right-1 text-xs p-1 bg-surface-500 rounded-lg bg-opacity-50 text-surface-600 dark:text-surface-300">Used in {used} courses</p>
            {/if}
        </div>
        <div class=" flex flex-col justify-between px-2 py-2 w-full h-3/5 border-t border-surface-300 dark:border-surface-700 items-center justify-elements-center">
            <!-- Title and difficulty -->
            <div class = "w-full">
                <div class="flex justify-between gap-2">
                    <h4 class="line-clamp-2 font-bold text-surface-700 max-w-[80%] text-sm dark:text-surface-100 self-center"> {name}</h4>
                    <div class="self-center">
                        {#if (numMaterials === 1)}
                            <Icon icon="mdi:presentation" class="text-primary-600 text-lg self-center"/>
                        {:else}
                            <div class="py-1" bind:this={hoverDiv}>
                                <Icon icon="clarity:file-group-solid" class="text-primary-600 text-lg self-center"/>
                                {#if isHovered}
                                    <div class="absolute  mt-2 bg-surface-50 bg-opacity-100 shadow-md p-2 rounded-lg flex gap-2 items-center transition-all duration-300" style="z-index: 9999;" transition:fly={{ y: -8, duration: 400 }}>
                                        <Icon icon="mdi:presentation" class="text-primary-600 text-lg self-center"/>
                                        <Icon icon="mdi:presentation" class="text-primary-600 text-lg self-center"/>
                                        <Icon icon="mdi:presentation" class="text-primary-600 text-lg self-center"/>

                                    </div>
                                {/if}
                            </div>

                        {/if}
                    </div>
                    <div class="self-center">
                        <DiffBar diff = {"hard"}></DiffBar>
                    </div>
                </div>


                <p class = "w-full line-clamp-2 text-xs text-surface-300  dark:text-surface-600">Updated 10 days ago</p>



            </div>

            <p class = "w-full line-clamp-3 text-xs text-surface-500  dark:text-surface-600">Lorem ipsum dolor sit a metsda awdafg mainaaubfaefbg aiuofbae d asd]adwwa. Lorem lorem lorem lorem... Lorem ipsum dolor sit a metsda awdafg mainaaubfaefbg aiuofbae d asd]adwwa. Lorem lorem lorem lorem.. Lorem ipsum dolor sit a metsda awdafg mainaaubfaefbg aiuofbae d asd]adwwa. Lorem lorem lorem lorem..</p>


            <div bind:this={container} class = "flex w-full mt-2 gap-1 flex-nowrap overflow-hidden">
                <div  class="flex gap-1">
                    {#each tags.slice(0, maxTags) as tag, i}
                        <Tag bind:width={tagWidths[i]} tagText={tag}></Tag>
                    {/each}
                </div>
                <div class=" self-center">
                    {#if (tags.length > maxTags)}
                        <p class="text-sm text-primary-500">+{tags.length - maxTags}</p>
                    {/if}
                </div>
            </div>

            <div class="bg-surface-200 w-full h-px"/>
                <div class="w-full flex justify-between">
                    <button class="py-1 px-4 bg-surface-700 text-surface-50 rounded-lg hover:bg-opacity-85">View</button>
                    <div class="flex gap-2">
                        <div class="flex items-center bg-surface-50 dark:bg-surface-800 rounded-lg ">
                            <button class="text-xs flex gap-x-1 items-center h-full w-full px-2 bg-surface-300 bg-opacity-0 hover:bg-opacity-25 rounded-l-lg" on:click={() => toggleLike()}>
                                <Icon bind:this={star} icon="material-symbols:star" class="text-lg {likedColor}"/>
                                <span>472</span>
                            </button>

                            <hr>

                            <button bind:this={bookmark} class="flex items-center text-xl text-surface-500 h-full w-full px-2 bg-surface-300 bg-opacity-0 hover:bg-opacity-25 rounded-r-lg" on:click={() => toggleSave()}>
                                <Icon icon="ic:baseline-bookmark" class="text-lg {savedColor}"/>
                            </button>
                        </div>

                        <Icon icon="gg:profile" class = "text-surface-600 justify-self-end self-center size-6"/>
                    </div>

                </div>
            </div>
    </div>
