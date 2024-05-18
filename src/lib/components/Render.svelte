<script lang="ts">
    import { CodeBlock } from '@skeletonlabs/skeleton';
    import Icon from '@iconify/svelte';

    export let activeFile:File;

    const decoder = new TextDecoder('utf-8');

    export let height:number;

    $: lineHeight = height;

    function getLanguage(type:string) {
        if (type.startsWith('text') || type.startsWith('application')) {
            let lang = type.split('/')[1];

            lang = lang === 'vnd.trolltech.linguist' ? 'typescript' : lang;

            let supported = ['xml', 'css', 'javascript', 'typescript', 'python', 'rust', 'plaintext']

            return supported.includes(lang) ? lang : 'plaintext';
        }
        return 'plaintext';
    }
</script>

<div style="height: {lineHeight}px;" class="min-h-92  border rounded-lg snap-y overflow-y-auto scroll-smooth snap-mandatory">
    {#if activeFile}
        {#await activeFile.arrayBuffer()}
            <div>Loading...</div>
        {:then file}
            {#if activeFile.type.startsWith('image')}
                <img src={URL.createObjectURL(new Blob([file], { type: 'image/png' }))} alt="Rendered from ArrayBuffer" />
            {:else if activeFile.type.startsWith('text') || activeFile.type.startsWith('application')}
                <CodeBlock language={getLanguage(activeFile.type)} code={decoder.decode(file)} />
            {:else}
                <div class="h-full w-full flex flex-col gap-2 justify-center items-center text-surface-500 dark:text-surface-300">
                    <Icon icon="bi:file-earmark" class="text-4xl text-surface-500 dark:text-surface-300" />
                    <p>Unsupported file type: {activeFile.type}</p>
                </div>
            {/if}
        {:catch error}
            <div>Error: {error.message}</div>
        {/await}
    {:else}
        No file selected
    {/if}
</div>
