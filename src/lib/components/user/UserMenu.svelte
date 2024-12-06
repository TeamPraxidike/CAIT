<script lang="ts">
    import { IconLink } from '$lib';
    import { page } from '$app/stores';
    import type { SupabaseClient } from '@supabase/supabase-js';
    import type { User } from '@prisma/client';

    export let supabase: SupabaseClient;
    export let loggedUser: User & { profilePicData: string | null };

    export let device: 'mobile' | 'desktop';

    const confirmPublishReset = (event: MouseEvent) => {
        const url = $page.url.pathname;
        if(url.includes('publish/') || url.includes('edit')){
            const confirmation = confirm('Data will be lost. Are you sure you want to proceed?');
            if (!confirmation) {
                event.preventDefault();
                return;
            }

        }
    }
    const handleSignOut = () => {
        const url = $page.url.pathname;
        if(url.includes('publish/') || url.includes('edit')){
            const confirmation = confirm('Data will be lost. Are you sure you want to proceed?');
            if (confirmation) {
                supabase.auth.signOut()
            }
        } else {
            supabase.auth.signOut()
        }
    }

    const defaultProfilePicturePath = "/defaultProfilePic/profile.jpg"

</script>

{#if loggedUser}
    {#if device === 'mobile'}
        <div class="grid grid-cols-2">
            <a href="/{loggedUser.id}"  on:click={confirmPublishReset}
               class="btn justify-start flex gap-2 items-center hover:bg-surface-200 rounded-lg p-1 dark:hover:bg-surface-700 col-span-2">
                <!--{#if loggedUser.profilePicData !== ''}-->
                <!--    <img class="h-16 w-16 rounded-full object-cover" src={'data:image;base64,' + loggedUser.profilePicData} alt={loggedUser.firstName}/>-->
                <!--{:else}-->
                <!--    <div class="h-16 w-16 placeholder-circle object-cover" />-->
                <!--{/if}-->
                <img class="h-16 w-16 rounded-full object-cover" src={loggedUser.profilePicData
                ? `data:image;base64,${loggedUser.profilePicData}`
                : defaultProfilePicturePath} alt={loggedUser.firstName}/>
                <div class="flex flex-col">
                    <span>{loggedUser.firstName}</span>
                    <span class="text-sm">Go to profile</span>
                </div>
            </a>
            <IconLink p="p-4" icon="ion:person-sharp" href="/{loggedUser.id}" link="Profile"/>
            <IconLink p="p-4" icon="ion:bookmark-sharp" href="/{loggedUser.id}/saved" link="Saved"/>
            <IconLink p="p-4" icon="ion:book" href="/{loggedUser.id}/publications" link="Publications"/>
            <button on:click={handleSignOut} class="anchor col-start-2">Log out</button>

        </div>
    {:else}
        <div class="card relative z-20 bg-surface-50 border border-surface-300 p-4 w-64
                                dark:text-surface-50 dark:border-none">
            <div class="flex flex-col">
                <a href="/{loggedUser.id}" on:click={confirmPublishReset}
                   class="btn justify-start flex gap-2 items-center hover:bg-surface-200 rounded-lg p-1
                      dark:hover:bg-surface-700">
                    {#if $page.data.session}
<!--                        <img class="h-16 w-16 rounded-full object-cover" src={'data:image;base64,' + loggedUser.profilePicData} alt={loggedUser.firstName}/>-->
                        <img class="h-16 w-16 rounded-full object-cover" src={loggedUser.profilePicData
                        ? `data:image;base64,${loggedUser.profilePicData}`
                        : defaultProfilePicturePath} alt={loggedUser.firstName}/>
                    {:else}
<!--                        <div class="h-16 w-16 placeholder-circle" />-->
                        <img class="h-16 w-16 rounded-full object-cover" src={loggedUser.profilePicData
                        ? `data:image;base64,${loggedUser.profilePicData}`
                        : defaultProfilePicturePath} alt={loggedUser.firstName}/>
                    {/if}
                    <div class="flex flex-col">
                        <span>{loggedUser.firstName}</span>
                        <span class="text-sm">Go to profile</span>
                    </div>
                </a>
                <hr class="my-2">
                <IconLink icon="ion:person-sharp" href="/{loggedUser.id}" link="Profile"/>
                <hr class="my-2">
            </div>
            <button on:click={handleSignOut} class="anchor">Log out</button>
        </div>
    {/if}
{/if}
