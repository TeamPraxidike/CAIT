<script lang="ts">
    import {authStore, IconLink} from "$lib";

    export let device: 'mobile' | 'desktop';

    const logout = () => authStore.logout();
</script>

{#if device === 'mobile'}
    <div class="grid grid-cols-2">
        <a href="/{$authStore.user?.id}"
           class="btn justify-start flex gap-2 items-center hover:bg-surface-200 rounded-lg p-1 dark:hover:bg-surface-700 col-span-2">
            {#if $authStore.user && $authStore.user.profilePicData !== ''}
                <img class="h-16 w-16 rounded-full" src={'data:image;base64,' + $authStore.user.profilePicData} alt={$authStore.user?.firstName}/>
            {:else}
                <div class="h-16 w-16 placeholder-circle" />
            {/if}
            <div class="flex flex-col">
                <span>{$authStore.user?.firstName}</span>
                <span class="text-sm">Go to profile</span>
            </div>
        </a>
        <IconLink p="p-4" icon="ion:person-sharp" href="/{$authStore.user?.id}" link="Profile"/>
        <IconLink p="p-4" icon="ion:bookmark-sharp" href="/{$authStore.user?.id}/saved" link="Saved"/>
        <IconLink p="p-4" icon="ion:book" href="/{$authStore.user?.id}/publications" link="Publications"/>
        <IconLink p="p-4" icon="ion:settings-sharp" href="/settings" link="Settings"/>
    </div>
{:else}
    <div class="card relative z-20 bg-surface-50 border border-surface-300 p-4 w-64
                            dark:text-surface-50 dark:border-none">
        <div class="flex flex-col">
            <a href="/{$authStore.user?.id}"
               class="btn justify-start flex gap-2 items-center hover:bg-surface-200 rounded-lg p-1
                  dark:hover:bg-surface-700">
                {#if $authStore.user && $authStore.user.profilePicData !== ''}
                    <img class="h-16 w-16 rounded-full" src={'data:image;base64,' + $authStore.user.profilePicData} alt={$authStore.user?.firstName}/>
                {:else}
                    <div class="h-16 w-16 placeholder-circle" />
                {/if}
                <div class="flex flex-col">
                    <span>{$authStore.user?.firstName}</span>
                    <span class="text-sm">Go to profile</span>
                </div>
            </a>
            <hr class="my-2">
            <IconLink icon="ion:person-sharp" href="/{$authStore.user?.id}" link="Profile"/>
            <IconLink icon="ion:bookmark-sharp" href="/{$authStore.user?.id}/saved" link="Saved"/>
            <IconLink icon="ion:book" href="/{$authStore.user?.id}/publications" link="Publications"/>
            <hr class="my-2">
            <IconLink icon="ion:settings-sharp" href="/settings" link="Settings"/>
            <hr class="my-2">
        </div>
        <button on:click={logout} class="anchor">Log out</button>
    </div>
{/if}

