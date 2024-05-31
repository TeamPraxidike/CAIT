<script lang="ts">
    import { IconLink } from '$lib';
    import { signOut } from '@auth/sveltekit/client';
    import { page } from '$app/stores';

    export let device: 'mobile' | 'desktop';

</script>

{#if device === 'mobile'}
    <div class="grid grid-cols-2">
        <a href="/{$page.data.session?.user?.id}"
           class="btn justify-start flex gap-2 items-center hover:bg-surface-200 rounded-lg p-1 dark:hover:bg-surface-700 col-span-2">
            {#if $page.data.session && $page.data.session.user.profilePicData !== ''}
                <img class="h-16 w-16 rounded-full" src={'data:image;base64,' + $page.data.session.user.profilePicData} alt={$page.data.session.user?.firstName}/>
            {:else}
                <div class="h-16 w-16 placeholder-circle" />
            {/if}
            <div class="flex flex-col">
                <span>{$page.data.session?.user?.firstName}</span>
                <span class="text-sm">Go to profile</span>
            </div>
        </a>
        <IconLink p="p-4" icon="ion:person-sharp" href="/{$page.data.session?.user?.id}" link="Profile"/>
        <IconLink p="p-4" icon="ion:bookmark-sharp" href="/{$page.data.session?.user?.id}/saved" link="Saved"/>
        <IconLink p="p-4" icon="ion:book" href="/{$page.data.session?.user?.id}/publications" link="Publications"/>
        <IconLink p="p-4" icon="ion:settings-sharp" href="/settings" link="Settings"/>
        <button on:click={() => signOut()} class="anchor">Log out</button>
    </div>
{:else}
    <div class="card relative z-20 bg-surface-50 border border-surface-300 p-4 w-64
                            dark:text-surface-50 dark:border-none">
        <div class="flex flex-col">
            <a href="/{$page.data.session?.user?.id}"
               class="btn justify-start flex gap-2 items-center hover:bg-surface-200 rounded-lg p-1
                  dark:hover:bg-surface-700">
                {#if $page.data.session?.user && $page.data.session.user.profilePicData !== ''}
                    <img class="h-16 w-16 rounded-full" src={'data:image;base64,' + $page.data.session.user.profilePicData} alt={$page.data.session.user.firstName}/>
                {:else}
                    <div class="h-16 w-16 placeholder-circle" />
                {/if}
                <div class="flex flex-col">
                    <span>{$page.data.session?.user.firstName}</span>
                    <span class="text-sm">Go to profile</span>
                </div>
            </a>
            <hr class="my-2">
            <IconLink icon="ion:person-sharp" href="/{$page.data.session?.user.id}" link="Profile"/>
            <IconLink icon="ion:bookmark-sharp" href="/{$page.data.session?.user.id}/saved" link="Saved"/>
            <IconLink icon="ion:book" href="/{$page.data.session?.user.id}/publications" link="Publications"/>
            <hr class="my-2">
            <IconLink icon="ion:settings-sharp" href="/settings" link="Settings"/>
            <hr class="my-2">
        </div>
        <button on:click={() => signOut()} class="anchor">Log out</button>
    </div>
{/if}

