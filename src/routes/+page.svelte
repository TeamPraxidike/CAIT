<script lang="ts">
    import { lorem, Meta, Section } from '$lib';
</script>

<Meta title="Home" description="CAIT" type="site"/>

<div id="hero" class="col-span-4 flex gap-y-8 flex-col-reverse row-start-1 items-center
                md:col-span-8 md:gap-12 md:grid md:grid-cols-6
                lg:col-span-12 lg:grid-cols-12 lg:gap-6">

    <!--    Hero Text Group    -->
    <div class="flex flex-col gap-9 z-10
                    md:mt-52 md:gap-6 md:col-start-1 md:col-span-3 md:row-start-1
                    lg:mt-80 lg:gap-6 lg:col-start-1 lg:col-span-6">

        <!--  Hero Heading  -->
        <div class="flex flex-col gap-4 ">
            <h1 class="font-extrabold lg:font-bold md:text-2xl lg:text-3xl xl:text-4xl">CAIT</h1>
            <h4 class="xl:pr-40 xl:text-1xl dark:text-surface-200">Community for AI Teachers: Contribute and search for
                lecture materials, assignments, exam questions and more!</h4>
        </div>
        <div class="flex flex-col gap-2 mb-20">
            <div class="flex gap-2">
                <a href="/browse">
                    <button class="btn p-3 text-surface-100 rounded-lg bg-primary-500 font-bold">See Publications
                    </button>
                </a>
            </div>
            <h6 class="text-sm dark:text-surface-300">Used by TU Delft and the entirety of the world</h6>
        </div>
    </div>
    <img data-testid="xl-hero" class="w-full sm:w-1/2 md:col-span-3 md:w-full lg:col-start-7 lg:col-span-6 xl:p-4"
         src="/heroArt.png" alt="">
    <hr class="col-span-full row-start-2">
</div>

<main class="col-span-full flex flex-col gap-10 my-20">
    <Section title="Circuits" description={lorem} subtitle="Define your learning flow"/>
    <Section title="Circuits" description={lorem} subtitle="Define your workflow"/>
</main>
