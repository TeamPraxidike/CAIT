<script lang="ts">
    import {createEventDispatcher} from "svelte";

    export let userId:number
    export let rep:number
    export let posts:number
    export let name:string
    export let userPhotoUrl:string
    const dispatch = createEventDispatcher()
    export const enterUserProfile = (user: { userId: number }) => {
        dispatch("UserProfileEntry", {value:user.userId})
        alert(user.userId)
    }
</script>
<button class="group" on:click={()=>{enterUserProfile({userId})}}>
        <div class=" flex w-24 h-32 md:w-52 md:h-52 text-surface-800 dark:text-surface-50 overflow-hidden card dark:bg-surface-700 p-2 md:p-3  card-hover bg-surface-50 hover:cursor-pointer rounded-lg hover:shadow-lg shadow hover:ring-1 hover:ring-primary-600 hover:ring-opacity-20r">
            <div class="flex flex-col space-y-2 items-start w-full md:pb-2" >
                <div class="w-full flex flex-col items-center">
                    <div class=" w-10 h-10 md:w-24 md:h-24 {userPhotoUrl === '' ? 'bg-surface-500 placeholder-circle' :  ''  }">
                    </div>
                    <div class="max-w-full">
                        <p class="dark:text-surface-50 hover:overflow-visible hover:whitespace-normal max-w-full truncate text-2xl">{name}</p>
                        <hr class="dark:bg-surface-50 bg-surface-300"/>
                    </div>
                </div>
                <div class="flex flex-col items-start w-full">
                        <span class="dark:text-surface-50 text-surface-800 text-xs md:text-sm">Rep: {rep}</span>
                        <span class="dark:text-surface-50 text-surface-800 text-xs md:text-sm">Posts: {posts}</span>
                </div>
            </div>
        </div>
</button>
