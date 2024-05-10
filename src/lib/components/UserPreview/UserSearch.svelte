<script lang="ts">
    export let userId:number|null;
    export let rep:number;
    export let posts:number;
    export let name:string;
    export let userPhotoUrl:string;
    export let department = "Department Info"
    let link:string;
    if(userId===null)
        link="/user";
    else
        link = `/user/${name}/${userId}`;
</script>

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
