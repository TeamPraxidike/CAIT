<script lang="ts">
    import {createEventDispatcher} from "svelte";
    import type {User} from "@prisma/client";
    const dispatch = createEventDispatcher()
    export const removeMaintainer=()=> {
        dispatch("removeMaintainer", {value: name})
    }
    export let view: "home"|"publish"|"material"|"search"
    export let user:User
    let userId=user.id;
    let rep = user.reputation;
    export let posts = 0;
    let name = user.firstName + user.lastName;
    export let userPhotoUrl:string;
    export let role:"Maintainer"|"Publisher"|null
    export let department = "Department Info"
    // Not sure exactly how the link to the page would look like
    //todo: change to actual link
    let link = `/user/${name}/${userId}`
    link=`/user`
</script>

{#if view === "search"}
    <a href={link} class="col-span-2 flex md:h-64 text-surface-800 dark:text-surface-50 overflow-hidden card dark:bg-surface-700 p-2 md:p-3  card-hover bg-surface-50 hover:cursor-pointer rounded-lg hover:shadow-lg shadow hover:ring-1 hover:ring-primary-600 hover:ring-opacity-20r">
        <div class="flex flex-col space-y-1 items-start w-full md:pb-2" >
            <div class="w-full flex flex-col items-center">
                <div class=" w-10 h-10 md:w-32 md:h-32 {userPhotoUrl === '' ? 'bg-surface-500 placeholder-circle' :  ''  }">
                </div>
                <div class="max-w-full items-center">
                    <p class="dark:text-surface-50 hover:overflow-visible hover:whitespace-normal max-w-full truncate md:text-2xl">{name}</p>
                    <hr class="dark:bg-surface-50 bg-surface-300"/>
                </div>
                <p class="dark:text-surface-50 dark:opacity-80 text-surface-400 hover:overflow-visible hover:whitespace-normal max-w-full truncate md:text-lg">{department}</p>

            </div>
            <div class="flex flex-col items-start w-full">
                <span class="dark:text-surface-50 text-surface-800 text-xs md:text-sm">Rep: {rep}</span>
                <span class="dark:text-surface-50 text-surface-800 text-xs md:text-sm">Posts: {posts}</span>
            </div>
        </div>
    </a>

    {:else if view==="material"}
    <a href={link}  class="col-span-1 md:h-28 overflow-hidden card dark:bg-surface-700 p-2 card-hover bg-surface-50 hover:cursor-pointer rounded-lg hover:shadow-lg shadow hover:ring-1 hover:ring-primary-600 hover:ring-opacity-20r">
        <div class="flex flex-col flex-1 items-center justify-center space-y-1">
            <div class="w-12 h-12 {userPhotoUrl === '' ? 'bg-surface-500 placeholder-circle' :  ''  }"/>
            <div>
                <div>{name}</div>
                <hr class="bg-surface-300"/>
            </div>
            <div class="text-sm md:text-md ">{role}</div>
        </div>
    </a>

    {:else if view === "publish"}
    <div style="width:fit-content; height:fit-content" class="group flex relative flex-col text-surface-800 dark:text-surface-50 overflow-hidden card dark:bg-surface-700 p-2 card-hover bg-surface-50 rounded-lg hover:shadow-lg shadow">
        <button on:click={removeMaintainer} class="absolute top-0 right-0 rounded-lg hidden group-hover:block">
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 36 36" {...$$props}>
                <path fill="#EB0000" d="m19.61 18l4.86-4.86a1 1 0 0 0-1.41-1.41l-4.86 4.81l-4.89-4.89a1 1 0 0 0-1.41 1.41L16.78 18L12 22.72a1 1 0 1 0 1.41 1.41l4.77-4.77l4.74 4.74a1 1 0 0 0 1.41-1.41Z" class="clr-i-outline clr-i-outline-path-1" />
                <path fill="#EB0000" d="M18 34a16 16 0 1 1 16-16a16 16 0 0 1-16 16m0-30a14 14 0 1 0 14 14A14 14 0 0 0 18 4" class="clr-i-outline clr-i-outline-path-2" />
                <path fill="none" d="M0 0h36v36H0z" />
            </svg>
        </button>
        <div class="flex flex-col items-center">
            <div class="w-10 h-10 {userPhotoUrl === '' ? 'bg-surface-500 placeholder-circle' :  ''  }">
            </div>
            <div>
                <p>{name}</p>
                <hr class="bg-surface-300"/>
            </div>
        </div>
    </div>

    {:else }
    <a href={link} class="col-span-2 h-20 text-surface-800 dark:text-surface-50 overflow-hidden card dark:bg-surface-700 pl-2 pr-2 card-hover bg-surface-50 hover:cursor-pointer rounded-lg hover:shadow-lg shadow hover:ring-1 hover:ring-primary-600 hover:ring-opacity-20r">
        <div class="flex space-x-3 items-center">
            <div class="w-12 h-12 {userPhotoUrl === '' ? 'bg-surface-500 placeholder-circle' :  ''  }">
            </div>
            <div class="flex flex-col items-start w-full">
                <div class="max-w-full">
                    <span class="dark:text-surface-50 max-w-full hover:overflow-visible truncate">{name}</span>
                    <hr class="dark:bg-surface-50 bg-surface-300"/>
                </div>
                <span>Rep: {rep}</span>
                <span>Posts: {posts}</span>
            </div>
        </div>
    </a>

{/if}