<script lang="ts">
    import Icon from "@iconify/svelte";

    export let files: FileList;
    export let activeFile: File;
    export let download:boolean;

</script>

<div class="rounded-lg border">
    {#if files}
        {#each files as file}
            <div class="flex items-center gap-2 p-2 border-b">
                <Icon icon="bi:filetype-{file.type}" class="text-xl text-surface-500"/>
                <button type="button" on:click = {() => activeFile = file}
                        class="hover:text-surface-700 underline cursor-pointer text-surface-500">{file.name}</button>

                {#if download}
                    <a type="button" href={URL.createObjectURL(file)} download="{file.name}" class="ml-auto">Download</a>
                {/if}
            </div>
        {/each}
    {/if}
</div>