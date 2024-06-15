<script lang="ts">
    export let title: string;
    export let subtitle: string;
    export let description: string;
    export let colour = 'text-surface-700';
    export let onAbout = false;
    export let img = '';
    export let mdFlex = 'md:flex-row'
</script>


<div class="flex flex-col-reverse {mdFlex} {colour}
            gap-4 xl:gap-6 justify-between">
    <div class="flex flex-col gap-8 md:justify-center">
        <div class="gap-4">
            <div class="gap-2">
                <h6 class="mb-1 text-surface-700 dark:text-surface-100 text-sm font-light">{subtitle}</h6>
                <h3 class="mb-2 font-semibold text-surface-800 dark:text-surface-100 text-xl">{title}</h3>
            </div>
            <p class="text-surface-400">{description}</p>
        </div>
        {#if !onAbout}
        <a href={`/about`} class="font-bold xl:font-extrabold underline underline-offset-4 max-md:text-[12px]">
            Go to
        </a>
            {/if}
    </div>
    <img src="{img}" alt="{title}" class="md:w-1/3 rounded-lg  h-64 object-fill"/>
</div>