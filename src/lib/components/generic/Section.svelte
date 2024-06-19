<script lang="ts">
    import Icon from "@iconify/svelte";

    export let title: string;
    export let subtitle: string;
    export let description: string;
    export let colour = 'text-surface-700';
    export let onAbout = false;
    export let img = '';
    export let mdFlex = 'md:flex-row'
    export let iconList = false;

    const icons = ["akar-icons:video", "icon-park-solid:notes", "material-symbols:assignment", "mdi:presentation", "healthicons:i-exam-multiple-choice", "mage:dots-horizontal-circle"]
    const types = ["Video", "Lecture Notes", "Assignment", "Slides", "Exam Questions", "Other"]
</script>


<div class="flex flex-col-reverse {mdFlex} {colour}
            gap-4 justify-between">
    <div class="flex flex-col gap-2 md:justify-center lg:w-1/2">
        <div class="gap-4">
            <div class="gap-2">
                <h6 class="mb-1 text-surface-700 dark:text-surface-100 text-sm font-light">{subtitle}</h6>
                <h3 class="mb-2 font-semibold text-surface-800 dark:text-surface-100 text-xl">{title}</h3>
            </div>
            <p class="text-surface-400">{description}</p>
        </div>

        {#if iconList}
            <div class="gap-32">
                <p class="text-surface-400">Material publications can be of several types:</p>
                <div>
                    {#each icons as icon, i}
                        <div class="flex flex-row">
                            <Icon icon={icon} class="self-center text-xl text-primary-500"/>
                            <p class="ml-2 text-surface-400"> - {types[i]}</p>
                        </div>
                    {/each}
                </div>
            </div>
        {/if}

        {#if !onAbout}
        <a href={`/about`} class="font-bold xl:font-extrabold underline underline-offset-4 max-md:text-[12px]">
            Go to
        </a>
            {/if}
    </div>
    <img src="{img}" alt="{title}" class="md:w-1/3 rounded-lg "/>
</div>