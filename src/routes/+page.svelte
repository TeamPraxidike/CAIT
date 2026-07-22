<script lang="ts">
	import { Meta, Section, YouTubeEmbed } from '$lib';
	import type { PageServerData } from './$types';

	export let data: PageServerData;

	const repText = 'The reputation system in the platform is based on the quantity and quality of the publications a user publishes.' +
		' It reflects on the activity of the user and how others rate their publications and comments. It is directly proportional ' +
		'to the number of publications, comments made and stars a user has received. If another user saves your publication, ' +
		'this will be reflected in an increase of your reputation.'
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
                    lg:mt-80 lg:gap-6 lg:col-start-1 lg:col-span-5">

		<!--  Hero Heading  -->
		<section class="flex flex-col gap-4" aria-label="Hero section">
			<img alt="Logo of CAIT with text" data-testid="xl-hero" class="w-1/2" src="/images/home/caitText.png">
			<h2 class="xl:pr-10 xl:text-1xl dark:text-surface-200">
				Community Archive for Integrated Teaching: Contribute and search for
				lecture materials, assignments, exam questions and more!
			</h2>
		</section>
		<a href="/browse">
			<button class="btn p-3 text-surface-100 rounded-lg bg-primary-700 font-bold">
				See Publications
			</button>
		</a>
	</div>
	<section class="w-full md:col-span-3 md:w-full lg:col-start-6 lg:col-span-7" aria-label="Hero image">
		<img alt="Hero welcoming art" data-testid="xl-hero" class="w-full" src="/images/home/heroArt.png">
	</section>
	<hr class="col-span-full row-start-2">
</section>
<main class="col-span-full my-20 flex flex-col gap-12">
	<section
		aria-labelledby="introduction-heading"
		class="overflow-hidden rounded-2xl border border-primary-200 bg-gradient-to-br from-primary-50 via-surface-50 to-surface-100 p-6 shadow-sm
		       dark:border-surface-600 dark:from-surface-800 dark:via-surface-900 dark:to-surface-800
		       md:p-8 lg:p-10">
		<div class="grid items-center gap-8 lg:grid-cols-5 lg:gap-12">
			<div class="lg:col-span-2">
				<p class="mb-2 text-sm font-semibold uppercase tracking-wider text-primary-700 dark:text-primary-300">
					New to CAIT?
				</p>
				<h2 id="introduction-heading" class="text-2xl font-semibold text-surface-900 dark:text-surface-50 md:text-3xl">
					Watch the introduction
				</h2>
				<p class="mt-4 leading-relaxed text-surface-700 dark:text-surface-200">
					See how CAIT helps educators find, share and connect teaching resources with a community of peers.
				</p>

				<ul class="mt-6 space-y-3 text-surface-700 dark:text-surface-200">
					<li class="flex items-start gap-3">
						<span class="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary-500" aria-hidden="true"></span>
						Discover reusable teaching materials
					</li>
					<li class="flex items-start gap-3">
						<span class="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary-500" aria-hidden="true"></span>
						Connect resources into guided circuits
					</li>
					<li class="flex items-start gap-3">
						<span class="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary-500" aria-hidden="true"></span>
						Share knowledge with other educators
					</li>
				</ul>
			</div>

			<div class="rounded-xl bg-surface-900 p-1 shadow-lg ring-1 ring-surface-900/10 lg:col-span-3">
				<YouTubeEmbed videoId="-Pe1rEs6RUs" title="Introduction to CAIT" />
			</div>
		</div>
	</section>

	<div class="flex items-center gap-4" aria-hidden="true">
		<div class="h-px flex-1 bg-surface-300 dark:bg-surface-600"></div>
		<span class="text-xs font-semibold uppercase tracking-widest text-surface-500 dark:text-surface-400">
			Explore the platform
		</span>
		<div class="h-px flex-1 bg-surface-300 dark:bg-surface-600"></div>
	</div>

	<Section title="Materials" description={matDescription} subtitle="Share your resources" onAbout={true} img="/images/about/publication.png" mdFlex="md:flex-row-reverse" iconList={true}/>
	<Section title="Circuits" description={circuitDescription} subtitle="Define your workflow" onAbout={true} img="/images/about/circuit.png" isImageWider={true}/>
	<Section title="Reputation" description={repText}  subtitle="Community contribution and activity" onAbout={true} userList={data.topUsers} mdFlex="md:flex-row-reverse"/>
</main>
