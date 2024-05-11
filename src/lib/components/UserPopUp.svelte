<script>
    import {authStore, IconLink} from "$lib";

    const logout = () => authStore.logout();
</script>

<div class="card bg-surface-50 border border-surface-300 p-4 w-64
                            dark:text-surface-50 dark:border-none" >
    <div class="flex flex-col">
        <a href="/{$authStore.user?.id}"
           class="btn justify-start flex gap-2 items-center hover:bg-surface-200 rounded-lg p-1
                  dark:hover:bg-surface-700">
            <enhanced:img class="h-16 w-16 rounded-full" src="/static/fdr.jpg" alt="Profile Picture"/>
            <div class="flex flex-col">
                <span>{$authStore.user?.firstName}</span>
                <span class="text-sm">Go to profile</span>
            </div>
        </a>
        <hr class="my-2">
        <IconLink icon="ion:person-sharp" href="/{$authStore.user?.id}" link="Profile"/>
        <IconLink icon="ion:bookmark-sharp" href="/{$authStore.user?.id}/saved" link="Saved"/>
        <IconLink icon="ion:book" href="/{$authStore.user?.id}/publication" link="My Publications"/>
        <hr class="my-2">
        <IconLink icon="ion:settings-sharp" href="/settings" link="Settings"/>
        <hr class="my-2">
    </div>
    <button on:click={logout} class="anchor">Log out</button>
</div>