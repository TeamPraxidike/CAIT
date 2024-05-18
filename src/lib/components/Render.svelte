<script lang="ts">
    import { CodeBlock } from '@skeletonlabs/skeleton';
    import Icon from '@iconify/svelte';

    export let file:File;

    const decoder = new TextDecoder('utf-8');

    function getLanguage(type:string) {
        if (type.startsWith('text') || type.startsWith('application')) {
            let lang = type.split('/')[1];

            lang = lang === 'vnd.trolltech.linguist' ? 'typescript' : lang;
            lang.startsWith('x-') ? lang = lang.split('-')[1] : lang;
            let supported = ['xml', 'css', 'javascript', 'typescript', 'python', 'rust', 'scala', 'plaintext']

            return supported.includes(lang) ? lang : 'plaintext';
        }
        return 'plaintext';
    }
</script>

<!--style="height: {lineHeight}px;" -->
<div class="bg-surface-100 p-8 rounded-lg flex flex-col">
    <h4 class="text-xl">{file.name}</h4>
    <p class="text-surface-500 dark:text-surface-300">{file.type}</p>
    <div class="w-[60vw] max-h-[85vh] border rounded-lg snap-y overflow-y-auto scroll-smooth snap-mandatory">
        {#if file.size > 1024*1024*10}
            <div class="h-full w-full flex flex-col gap-2 justify-center items-center text-surface-500 dark:text-surface-300">
                <Icon icon="bi:exclamation-triangle" class="text-4xl text-surface-500 dark:text-surface-300" />
                <p>File too large to render</p>
            </div>
        {:else}
            {#await file.arrayBuffer()}
                <div>Loading...</div>
            {:then fileBuffer}
                {#if file.type.startsWith('image')}
                    <img src={URL.createObjectURL(new Blob([fileBuffer], { type: 'image/png' }))} alt="Rendered from ArrayBuffer" />
                {:else if file.type.startsWith('video')}
                    <video class="bg-black w-full max-h-[70vh]" controls>
                        <track kind="captions"  src="">
                        <track kind="subtitles" src="">
                        <source src={URL.createObjectURL(new Blob([fileBuffer], { type: file.type }))} type={file.type} />
                    </video>
                {:else if file.type.startsWith('text') || file.type.startsWith('application')}
                    <CodeBlock language={getLanguage(file.type)} code={decoder.decode(fileBuffer)} />
                {:else}
                    <div class="h-full w-full flex flex-col gap-2 justify-center items-center text-surface-500 dark:text-surface-300">
                        <Icon icon="bi:file-earmark" class="text-4xl text-surface-500 dark:text-surface-300" />
                        <p>Unsupported file type: {file.type}</p>
                    </div>
                {/if}
            {:catch error}
                <div>Error: {error.message}</div>
            {/await}
        {/if}
    </div>
</div>
