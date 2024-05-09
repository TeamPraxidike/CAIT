<script lang="ts">
    import {createEventDispatcher} from "svelte";

    export let userId:number
    export let name="Ivan"
    export let userPhoto = ""
    export let role:"Maintainer"|"Publisher"
    const dispatch = createEventDispatcher()
    export const enterUserProfile = (user: { userId: number }) => {
        dispatch("UserProfileEntry", {value:user.userId})
    }
</script>
<button on:click={() => enterUserProfile({userId})}>
        <div style="width:fit-content" class="overflow-hidden card dark:bg-surface-700 p-2 card-hover bg-surface-50 hover:cursor-pointer rounded-lg hover:shadow-lg shadow hover:ring-1 hover:ring-primary-600 hover:ring-opacity-20r">
            <div style="width:fit-content" class="flex flex-col flex-1 items-center justify-center space-y-1">
                <div class="w-12 h-12 {userPhoto === '' ? 'bg-surface-500 placeholder-circle' :  ''  }"/>
                <div>
                    <div>{name}</div>
                    <hr class="bg-surface-300"/>
                </div>
                <div>{role}</div>
            </div>
        </div>
</button>


