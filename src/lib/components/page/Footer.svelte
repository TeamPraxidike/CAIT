<!-- Footer Class
    @uses: `Icon` to import icons from the Iconify package
    @ret: a responsive header that can be prepended to any page
-->
<script lang="ts">
    import Icon from "@iconify/svelte";
    import {Grid} from "$lib";
</script>

<footer class="w-full relative z-50 py-20 text-surface-400 mt-28 overflow-x-hidden">
    <Grid>
        <!-- Left Section -->
        <div class="flex flex-col gap-4 col-span-4
                    md:row-start-1 md:col-span-8
                    xl:col-start-1 xl:col-span-4">
            <h4>CAIT</h4>
            <p class="text-surface-400">Community for AI Teachers: Contribute and search for
                lecture materials, assignments, exam questions and more!</p>
            <div class="flex flex-row gap-2">
                <Icon color="grey" height="25" icon="mdi:facebook" />
                <Icon color="grey" height="25" icon="mdi:twitter" />
                <Icon color="grey" height="25" icon="mdi:github" />
            </div>
        </div>

        <!-- Central Section -->
        <div class="flex flex-col gap-4 col-span-4 mt-16
                    md:row-start-2 md:col-span-3 xl:mt-0
                    xl:row-start-1 xl:col-start-5 xl:col-span-4">
            <h4>Links</h4>
            <div class="flex flex-row gap-8">
                <div class="flex flex-col gap-2">
                    <a href="/about">About</a>
                    <a href="/browse">Browse</a>
                </div>
            </div>
        </div>

        <!-- Right Section -->
        <div class="flex flex-col gap-4 col-span-4 mt-16
                    md:row-start-2 md:col-span-4 xl:mt-0
                    xl:row-start-1 xl:col-start-9 xl:col-span-4">
            <h4>Contact</h4>
            <p class="flex gap-2"><Icon color="grey" height="25" icon="mdi:email" /> cait-ewi@tudelft.nl</p>
        </div>
    </Grid>
</footer>

<style lang="css">
  footer {
    background-color: #222222;
  }

  h4 {
    color: #ffffff;
  }

  p {
    color: #8C8C8C;
  }
</style>