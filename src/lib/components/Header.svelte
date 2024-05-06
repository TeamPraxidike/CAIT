<script lang="ts">
    import {Grid} from "$lib";
    import { LightSwitch } from '@skeletonlabs/skeleton';
</script>

<header class="w-screen dark:bg-surface-900 bg-gray-">
    <Grid>
        <img class="col-start-1" src=Logo.webp alt="CAIT Logo"/>
        <div class="col-start-2 xl:col-span-10 flex flex-nowrap self-center xl:gap-4">
            <a class="underline" href="/about">About</a>
        </div>
        <div class="col-start-4 self-center xl:col-start-12">
            <LightSwitch />
        </div>
    </Grid>
</header>