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
    }
</script>
<button on:click={()=>{enterUserProfile({userId})}}>
        <div style="width:fit-content; height:fit-content" class=" flex w-20 h-40 text-surface-800 dark:text-surface-50 overflow-hidden card dark:bg-surface-700 p-2 md:p-4  card-hover bg-surface-50 hover:cursor-pointer rounded-lg hover:shadow-lg shadow hover:ring-1 hover:ring-primary-600 hover:ring-opacity-20r">
            <div class="flex flex-col  space-y-3 items-start">
                <div class="w-full flex flex-col items-center">
                    <div class="w-24 h-24 {userPhotoUrl === '' ? 'bg-surface-500 placeholder-circle' :  ''  }">
                    </div>
                    <div>
                        <div id="nameDiv">{name}</div>
                        <hr class="bg-surface-300"/>
                    </div>
                </div>
                <div class="flex flex-col items-start  w-full">
                    <div class="w-full">
                        <div class="flex space-x-1">
                            <div>Rep:</div>
                            <div>{rep}</div>
                        </div>
                        <div class="flex space-x-1">
                            <div>Posts:</div>
                            <div>{posts}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
</button>
