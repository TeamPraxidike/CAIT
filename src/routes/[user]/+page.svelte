<script lang="ts">
    import {Meta, PublicationCard, UserProfileBar} from "$lib";
    import type {LayoutData} from './$types';

    /* This is the data that was returned from the server */
    export let data: LayoutData;

    let user = data.user;
</script>

<Meta title="Profile" description="CAIT" type="site"/>

<UserProfileBar {user}/>

<div class="grid grid-cols-3 gap-4 mb-20
            md:col-span-8 lg:col-span-12 xl:col-span-8">
    <h3 class="text-xl mt-8 text-surface-900 col-span-3 text-center dark:text-surface-50">
        Saved Publications
    </h3>
    <p>aa</p>
    <h3 class="text-xl mt-8 text-surface-900 col-span-3 text-center dark:text-surface-50">
        {user.firstName}'s Publications
    </h3>
    {#each data.user.posts as publication}
        <PublicationCard {publication} />
    {/each}
</div>


