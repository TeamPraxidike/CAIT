<script lang="ts">

    export let userId:number
    import {createEventDispatcher} from "svelte";

    export let rep:number
    export let posts:number
    export let name:string
    export let userPhotoUrl:string
    const dispatch = createEventDispatcher()
    export const enterUserProfile = (user: { userId: number }) => {
        dispatch("UserProfileEntry", {value:user.userId})
    }
</script>
<button on:click={() => enterUserProfile({userId})}>
    <div class="w-48 h-20 text-surface-800 dark:text-surface-50 overflow-hidden card dark:bg-surface-700 pl-2 pr-2 card-hover bg-surface-50 hover:cursor-pointer rounded-lg hover:shadow-lg shadow hover:ring-1 hover:ring-primary-600 hover:ring-opacity-20r">
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
    </div>
</button>
