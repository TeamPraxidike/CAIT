<script lang="ts">
    import {Meta, UserProfileBar} from "$lib";
    import type { PageServerData } from './$types';
    import type {User} from "@prisma/client";

    /* This is the data that was returned from the server */
    export let data:PageServerData;

    let user:User = data.user;
</script>

<Meta title="Profile" description="CAIT" type="site" />

<UserProfileBar {user} />

<h3 class="text-xl mt-8 text-surface-900 col-span-4 text-center
           md:col-span-8
           lg:col-span-12
           xl:col-span-8">
    {user.firstName}'s Publications
</h3>

<!-- TODO: @vguenov add your components here! Just plop them and the grid will take care of it -->

<h3 class="text-xl mt-8 text-surface-900 col-span-4 text-center
           md:col-span-8
           lg:col-span-12
           xl:col-span-8">
    Saved Publications
</h3>

<!-- TODO: @vguenov add your components here! Just plop them and the grid will take care of it -->

