<script lang="ts">
    import {createEventDispatcher} from "svelte";
    export let name="Ivan"
    //todo: CDN for images possibly?
    export let userPhoto = ""
    const dispatch = createEventDispatcher()
    export const removeMaintainer=()=>{
        dispatch("removeMaintainer", {value: name})
    }
</script>

<div style="width:fit-content; height:fit-content" class="group flex relative flex-col text-surface-800 dark:text-surface-50 overflow-hidden card dark:bg-surface-700 p-2 card-hover bg-surface-50 rounded-lg hover:shadow-lg shadow">
    <button on:click={removeMaintainer} class="absolute top-0 right-0 rounded-lg hidden group-hover:block">
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 36 36" {...$$props}>
            <path fill="#EB0000" d="m19.61 18l4.86-4.86a1 1 0 0 0-1.41-1.41l-4.86 4.81l-4.89-4.89a1 1 0 0 0-1.41 1.41L16.78 18L12 22.72a1 1 0 1 0 1.41 1.41l4.77-4.77l4.74 4.74a1 1 0 0 0 1.41-1.41Z" class="clr-i-outline clr-i-outline-path-1" />
            <path fill="#EB0000" d="M18 34a16 16 0 1 1 16-16a16 16 0 0 1-16 16m0-30a14 14 0 1 0 14 14A14 14 0 0 0 18 4" class="clr-i-outline clr-i-outline-path-2" />
            <path fill="none" d="M0 0h36v36H0z" />
        </svg>
    </button>
    <div class="flex flex-col items-center">
        <div class="w-10 h-10 {userPhoto === '' ? 'bg-surface-500 placeholder-circle' :  ''  }">
        </div>
        <div>
            <p>{name}</p>
            <hr class="bg-surface-300"/>
        </div>
    </div>
</div>
