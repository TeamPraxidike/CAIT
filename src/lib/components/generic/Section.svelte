<script lang="ts">
    export let title: string;
    export let subtitle: string;
    export let description: string;
</script>


<div class="flex flex-col-reverse md:flex-row text-surface-700
            gap-4 xl:gap-6">
    <div class="flex flex-col gap-8 md:w-1/2 md:justify-center">
        <div class="gap-4">
            <div class="gap-2">
                <h6 class="mb-1 text-surface-700 dark:text-surface-100 text-sm font-light">{subtitle}</h6>
                <h3 class="mb-2 font-semibold text-surface-800 dark:text-surface-100 text-xl">{title}</h3>
            </div>
            <p class="text-surface-400">{description}</p>
        </div>
        <a href={`/about`} class="font-bold xl:font-extrabold underline underline-offset-4 max-md:text-[12px]">
            Go to
        </a>
    </div>
    <div class="md:w-1/2 rounded-lg h-64 bg-surface-200"></div>
<!--    <img src="fdr.jpg" alt="fdrkata" class="md:w-1/2 rounded-lg">-->
</div>