<script lang="ts">
    import { Meta } from '$lib';
    // https://vite.dev/guide/assets#static-asset-handling
    import content from './content.html?raw'
</script>

<Meta title="Cookie Policy" description="CAIT Cookie Policy" type="site" />

<article class="col-span-full my-16 prose max-w-3xl mx-auto dark:prose-invert prose-a:text-blue-500">
    {@html content}
</article>