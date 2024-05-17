<script lang="ts">
    import { CodeBlock } from '@skeletonlabs/skeleton';

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

<div style="max-height: {lineHeight}px;" class="min-h-40 border rounded-lg row-span-3 snap-y overflow-y-auto scroll-smooth snap-mandatory">
    {#if activeFile}
        {#await activeFile.arrayBuffer()}
            <div>Loading...</div>
        {:then file}
            {#if activeFile.type.startsWith('image')}
                <img src={URL.createObjectURL(new Blob([file], { type: 'image/png' }))} alt="Rendered from ArrayBuffer" />
            {:else if activeFile.type.startsWith('text') || activeFile.type.startsWith('application')}
                <CodeBlock language={getLanguage(activeFile.type)} code={decoder.decode(file)} />
            {:else}
                <p>Unsupported file type: {activeFile.type}</p>
            {/if}
        {:catch error}
            <div>Error: {error.message}</div>
        {/await}
    {:else}
        No file selected
    {/if}
</div>