<script lang="ts">
    import {type File} from "@prisma/client";
    import Icon from "@iconify/svelte";

    export let files: File[];
    export let activeFile: File;

    function takeExtension(path: string): string {
        return path.split('.').pop() || "";
    }


</script>

<div class="rounded-lg border">
    {#each files as file}
        <div class="flex items-center gap-2 p-2 border-b">
            <Icon icon="bi:filetype-{takeExtension(file.path)}" class="text-xl text-surface-500"/>
            <button on:click = {() => activeFile = file}
                    class="hover:text-surface-700 underline cursor-pointer text-surface-500">{file.title}</button>
        </div>
    {/each}
</div>