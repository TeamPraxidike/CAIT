<script lang="ts">
	import { Meta, Section } from '$lib';
	const repText = 'The reputation system in the platform is based on the quantity and quality of the publications a user publishes.' +
		' It reflects on the activity of the user and how others rate their publications and comments.It is directly proportional ' +
			'to the number of publications, comments made and stars a user has received. If another user saves or indicates that they ' +
			'use your publication, this will be reflected in an increase of your reputation.'
	const initiative = 'This initiative was started by the ML teacher community at TU Delft in their attempt to increase collaboration between different lecturers in their preparation for their courses. This platform was developed to facilitate sharing machine learning education materials between TU Delft teachers. We are looking for feedback to improve this platform and make it useful for you!';
	const matDescription = 'The smallest and most common unit of publication on the platform represents a collection of files, which are described by the users with metadata such as title, publication, difficulty and tags. One such collection can include files of a variety of types (PDF, Python notebook and more).';
	const circuitDescription = 'The circuit is a type of publication, where you can organize and define connections between multiple publications. In a circuit, you can add a materials publication that was described above or another circuit in a node. These nodes can be connected with directed edges which represent the suggested order of examining the publications.';
</script>

<Meta title="About" description="CAIT" type="site" />


<section class="col-span-full" aria-label="About me page heading">
	<h1 class="font-extrabold lg:font-bold md:text-2xl lg:text-3xl xl:text-4xl mt-20">About</h1>
	<h2>Community for AI Teachers: Contribute and search for lecture materials, assignments, exam questions and more!</h2>
</section>

<main class="col-span-full flex flex-col gap-10 mb-20">
	<Section title="CAIT Initiative" description={initiative} subtitle="How it started" onAbout={true} img="/images/about/cait_logo_big.png"/>
	<Section title="Materials" description={matDescription} subtitle="Share your resources" onAbout={true} img="/images/about/publicationCard.png" mdFlex="md:flex-row-reverse" iconList={true}/>
	<Section title="Circuits" description={circuitDescription} subtitle="Define your workflow" onAbout={true} img="/images/about/circuit.png"/>
	<Section title="Reputation" description={repText}  subtitle="Community contribution and activity" onAbout={true} img="/images/about/reputation.png" mdFlex="md:flex-row-reverse"/>
</main>
