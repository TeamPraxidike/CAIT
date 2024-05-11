<script lang="ts">
    export let tagText:string;
    export let width:number;
</script>



<div bind:clientWidth={width} class="bg-primary-50 bg-opacity-50 dark:bg-primary-400 dark:bg-opacity-25 inline-flex rounded-lg py-1 px-2  border border-surface-200 dark:border-surface-600 whitespace-nowrap" >
    <p class="dark:text-surface-100 text-xs text-primary-500 text-opacity-50 dark:text-primary-300 ">{tagText}</p>
</div>
