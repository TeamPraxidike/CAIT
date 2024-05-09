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
    <div  class="w-30 h-20 text-surface-800 dark:text-surface-50 overflow-hidden card dark:bg-surface-700 p-2  md:pb-2 md:pt-2 md:pr-3 card-hover bg-surface-50 hover:cursor-pointer rounded-lg hover:shadow-lg shadow hover:ring-1 hover:ring-primary-600 hover:ring-opacity-20r">
        <div class="flex space-x-3 items-center w-full">
            <div class="w-10 h-10 {userPhotoUrl === '' ? 'bg-surface-500 placeholder-circle' :  ''  }">
            </div>
            <div class="flex flex-col items-start w-full">
                <div>
                    <div id="nameDiv">{name}</div>
                    <hr class="bg-surface-300"/>
                </div>
                <div>
                    <div class="flex space-x-1 w-full">
                        <div>Rep:</div>
                        <div>{rep}</div>
                    </div>

                    <div class="flex space-x-1 w-full">
                        <div>Posts:</div>
                        <div>{posts}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</button>
