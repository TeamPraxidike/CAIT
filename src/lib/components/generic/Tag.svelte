<script lang="ts">
    export let tagText:string
</script>






{#if tagText !== ""}
    <div class="bg-primary-50 inline-flex rounded-lg py-1 px-2">
        <p class="text-surface-800">{tagText}</p>
    </div>
{/if}