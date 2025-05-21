<script lang="ts">
	import { Meta, Section } from '$lib';
</script>

<Meta title="Home" description="CAIT" type="site" />

<section id="hero" class="col-span-4 flex gap-y-8 flex-col-reverse row-start-1 items-center
                md:col-span-8 md:gap-12 md:grid md:grid-cols-6
                lg:col-span-12 lg:grid-cols-12 lg:gap-6">

	<!--    Hero Text Group    -->
	<div class="flex flex-col gap-9 z-10
                    md:mt-52 md:gap-6 md:col-start-1 md:col-span-3 md:row-start-1
                    lg:mt-80 lg:gap-6 lg:col-start-1 lg:col-span-6">

		<!--  Hero Heading  -->
		<section class="flex flex-col gap-4" aria-label="Hero section">
			<h1 class="font-extrabold lg:font-bold md:text-2xl lg:text-3xl xl:text-4xl">CAIT</h1>
			<h2 class="xl:pr-40 xl:text-1xl dark:text-surface-200">
				Community for AI Teachers: Contribute and search for
				lecture materials, assignments, exam questions and more! 
			</h2>
		</section>
		<a href="/browse">
			<button class="btn p-3 text-surface-100 rounded-lg bg-primary-700 font-bold">
				See Publications
			</button>
		</a>
	</div>
	<section class="w-full sm:w-1/2 md:col-span-3 md:w-full lg:col-start-7 lg:col-span-6 xl:p-4" aria-label="Hero image">
		<img alt="Hero welcoming art" data-testid="xl-hero" class="w-full" src="/images/home/heroArt.png">
	</section>
	<hr class="col-span-full row-start-2">
</section>

<main class="col-span-full flex flex-col gap-10 my-20">
	<Section title="Materials" description={'Learn more about the content you can find on this platform'}
			 subtitle="What you can expect to find" img='/images/home/materials.svg' />
	<Section title="Circuits"
			 description={'Learn more about how to organize publications and give an order to them in a circuit'}
			 subtitle="Define your learning workflow" img='/images/home/circuit.png' />
</main>
