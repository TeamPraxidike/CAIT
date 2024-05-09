<script lang="ts">
    export let name="Ivan"
    //todo: CDN for images possibly?
    export let userPhoto = ""
</script>

<div class="flex">
    <div style="width:fit-content; height:fit-content" class=" flex text-surface-800 dark:text-surface-50 overflow-hidden card dark:bg-surface-700 p-2 card-hover bg-surface-50 hover:cursor-pointer rounded-lg hover:shadow-lg shadow hover:ring-1 hover:ring-primary-600 hover:ring-opacity-20r">
        <div class="flex flex-col items-center">
            <div class="w-8 h-8 {userPhoto === '' ? 'bg-surface-500 placeholder-circle' :  ''  }">
            </div>
            <div>
                <p>{name}</p>
                <hr class="bg-surface-300"/>
            </div>
        </div>
    </div>
</div>
