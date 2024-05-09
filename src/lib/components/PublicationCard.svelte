<script lang="ts">

import {DiffBar} from "$lib";

import Icon from "@iconify/svelte";
import {createEventDispatcher, onMount} from "svelte";
import type {PopupSettings} from "@skeletonlabs/skeleton";
import { popup } from '@skeletonlabs/skeleton';


    export let liked:boolean = true;

    export let saved:boolean = true;

    const dispatch = createEventDispatcher()


let star:HTMLDivElement
let bookmark:HTMLButtonElement
 const toggleLike = () => {
        liked = !liked
        if (liked) {
            star.classList.remove("text-surface-500")
            star.classList.add("text-secondary-500")
        }
        else{
            star.classList.remove("text-secondary-500")
            star.classList.add("text-surface-500")
        }
    }

const toggleSave = () => {
    saved = !saved
    if (saved) {
        bookmark.classList.remove("text-surface-500")
        bookmark.classList.add("text-secondary-500")
        dispatch("savedPublication")
    }
    else{
        bookmark.classList.remove("text-secondary-500")
        bookmark.classList.add("text-surface-500")
    }
}

    onMount(()=>{
    if (liked) {
        star.classList.remove("text-surface-500")
        star.classList.add("text-secondary-500")
    }
    else{
        star.classList.remove("text-secondary-500")
        star.classList.add("text-surface-500")
        }
        if (saved) {
            bookmark.classList.remove("text-surface-500")
            bookmark.classList.add("text-secondary-500")
        }
        else{
            bookmark.classList.remove("text-secondary-500")
            bookmark.classList.add("text-surface-500")
        }

})




// const onClick = () => {
//     dispatch("Help", {value:value})
// }
</script>


    <div class="w-64 h-64 rounded-lg shadow-md shadow-surface-400">
        <div class="w-full h-2/5 rounded-t-lg">

        </div>
        <div class=" flex flex-col justify-between px-2 py-2 w-full h-3/5 border-t border-surface-300  items-center justify-elements-center">

            <div class = "flex justify-between w-full">
                <h4 class="line-clamp-2 weight-strong text-sm"> Deatils About CNN and ANN</h4>
                <DiffBar diff = {"hard"}></DiffBar>
            </div>
            <div>
                <p class = "w-full line-clamp-3 text-xs text-surface-600">Lorem ipsum dolor sit a metsda awdafg mainaaubfaefbg aiuofbae d asd]adwwa. Lorem lorem lorem lorem Lorem ipsum dolor sit a metsda awdafg mainaaubfaefbg aiuofbae d asd]adwwa</p>

            </div>
            <div class="w-full flex justify-between">
                <div class="flex items-center bg-surface-100 rounded-lg ">
                    <button class="flex gap-x-1 items-center h-full w-full px-2 bg-surface-300 bg-opacity-0 hover:bg-opacity-25 rounded-l-lg" on:click={() => toggleLike()}>
                        <div bind:this={star} class="text-xl ">
                            <Icon icon="material-symbols:star"/>
                        </div>

                        <span>472</span>
                    </button>

                    <div class=" border-l border-surface-200 h-6"/>
                    <button bind:this={bookmark} class="flex items-center text-xl text-surface-500 h-full w-full px-2 bg-surface-300 bg-opacity-0 hover:bg-opacity-25 rounded-r-lg" on:click={() => toggleSave()}>
                        <Icon icon="ic:baseline-bookmark"/>
                    </button>
                </div>
                <div class="text-surface-800 text-3xl self-center"><Icon icon="mdi:presentation"/></div>

                <Icon icon="gg:profile" className = "text-surface-600 justify-self-end" width="32" height="32"/>

            </div>
        </div>
    </div>

