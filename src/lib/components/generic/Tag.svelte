<script lang="ts">
    export let tagText:string
    export let width:number = 0;
</script>

{#if tagText !== ""}
    <div bind:clientWidth={width} class="bg-primary-50 inline-flex rounded-lg py-1 px-2">
        <p class="text-surface-800">{tagText}</p>
    </div>
{/if}