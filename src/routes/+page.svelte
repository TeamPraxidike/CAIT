<script lang="ts">
	import { Meta, Section } from '$lib';

	const repText = 'The reputation system in the platform is based on the quantity and quality of the publications a user publishes.' +
		' It reflects on the activity of the user and how others rate their publications and comments.It is directly proportional ' +
		'to the number of publications, comments made and stars a user has received. If another user saves or indicates that they ' +
		'use your publication, this will be reflected in an increase of your reputation.'
	const matDescription = 'The smallest and most common unit of publication on the platform represents a collection of files, which are described by the users with metadata such as title, publication, difficulty and tags. One such collection can include files of a variety of types (PDF, Python notebook and more).';
	const circuitDescription = 'The circuit is a type of publication, where you can organize and define connections between multiple publications. In a circuit, you can add a materials publication that was described above or another circuit in a node. These nodes can be connected with directed edges which represent the suggested order of examining the publications.';
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
	<Section title="Materials" description={matDescription} subtitle="Share your resources" onAbout={true} img="/images/about/publication.png" mdFlex="md:flex-row-reverse" iconList={true}/>
	<Section title="Circuits" description={circuitDescription} subtitle="Define your workflow" onAbout={true} img="/images/about/circuit.png"/>
	<Section title="Reputation" description={repText}  subtitle="Community contribution and activity" onAbout={true} img="/images/about/reputation.png" mdFlex="md:flex-row-reverse"/>
</main>
