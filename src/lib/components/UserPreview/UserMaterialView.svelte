<script lang="ts">
    export let userId:number|null
    export let name="Ivan"
    export let userPhoto = ""
    export let role:"Maintainer"|"Publisher"
    let link:string;
    if(userId===null)
        link="/user"
    else
        link = `/user/${name}/${userId}`
</script>

<a href={link}  class="col-span-1 md:h-28 overflow-hidden card dark:bg-surface-700 p-2 card-hover bg-surface-50 hover:cursor-pointer rounded-lg hover:shadow-lg shadow hover:ring-1 hover:ring-primary-600 hover:ring-opacity-20r">
    <div class="flex flex-col flex-1 items-center justify-center space-y-1">
        <div class="w-12 h-12 {userPhoto === '' ? 'bg-surface-500 placeholder-circle' :  ''  }"/>
        <div>
            <div>{name}</div>
            <hr class="bg-surface-300"/>
        </div>
        <div class="text-sm md:text-md ">{role}</div>
    </div>
</a>


