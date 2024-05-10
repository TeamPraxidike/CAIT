<script lang="ts">
    import type {User} from "@prisma/client";

    export let user:User;
    let about = "Franklin Delano Roosevelt[a] (January 30, 1882 – April 12, 1945), commonly known by his initials FDR, was an American statesman and politician who served as the 32nd president of the United States from 1933 until his death in 1945. He was a member of the Democratic Party and is the only U.S. president to have served more than two terms."
</script>

<div class="col-span-4 flex flex-col items-center gap-2 text-surface-800 rounded-b-lg pb-4 border border-surface-300 border-t-0
            sm:col-span-4 sm:flex-row sm:px-8 sm:flex-wrap
            md:col-span-8 md:py-8
            lg:col-span-12
            xl:col-span-4 xl:row-span-12
            dark:bg-surface-800 dark:text-surface-50 dark:border-none">
    <enhanced:img class="w-64 rounded-full my-4 border" src="/static/fdr.jpg" alt="CAIT Logo"/>
    <div class="flex px-2 justify-center gap-x-4 gap-y-2 flex-wrap items-center
                md:w-7/12 md:justify-start
                xl:w-full">
        <h2 class="text-xl">{user.firstName} {user.lastName}</h2>
        <p class="variant-soft-primary md:hidden p-1 rounded-lg">Reputation: {user.reputation}</p>

        <div class="hidden md:flex items-start flex-col gap-4 text-surface-700 dark:text-surface-200 ">
            <p>Email: {user.email}</p>
            <hr class="w-full">
            <p class="text-surface-700 dark:text-surface-400">
                {about}
            </p>
            <p class="variant-soft-primary hidden md:block p-1 rounded-lg">Reputation: {user.reputation}</p>
        </div>
    </div>
    <hr class="w-full my-2 md:w-0">
    <div class="px-4 w-full dark:text-surface-200 flex flex-col items-stretch gap-4
                md:hidden">
        <p>Email: {user.email}</p>
        <p class="text-surface-700 dark:text-surface-400">
            {about}
        </p>
    </div>

    <div class="flex gap-2">

    </div>
</div>