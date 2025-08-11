<script lang="ts">
    //Helps understand if the grid is being used as a page where we need the margins or in a popup where we don't
    export let pageGrid : boolean = true;
    export let margins = pageGrid ? "md:mx-8 lg:mx-16 xl:mx-32 2xl:mx-56" : "md:mx-6 lg:mx-8 xl:mx-16 2xl:mx-16 w-full"
</script>

<div class="grid grid-cols-4 gap-2 mx-4
             md:grid-cols-8 md:gap-4
             lg:grid-cols-12 lg:gap-2 {margins}">
    <slot />
</div>