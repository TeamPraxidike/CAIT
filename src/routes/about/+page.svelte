<script lang="ts">
	import { Meta } from '$lib';
	import { onMount, onDestroy } from 'svelte';

	let sponsorContainer: HTMLDivElement | null = null;
	let intervalId: ReturnType<typeof setInterval> | null = null;
	let currentIndex = 0;

	function startAutoScroll() {
		if (!sponsorContainer) return;
		const container = sponsorContainer;
		const children = container.children;
		if (children.length <= 1) return;

		if (window.innerWidth >= 768) return;

		stopAutoScroll();
		intervalId = setInterval(() => {
			currentIndex = (currentIndex + 1) % children.length;
			const child = children[currentIndex] as HTMLElement;
			container.scrollTo({ left: child.offsetLeft, behavior: 'smooth' });
		}, 3000);
	}

	function stopAutoScroll() {
		if (intervalId) {
			clearInterval(intervalId);
			intervalId = null;
		}
	}

	function handleResize() {
		stopAutoScroll();
		currentIndex = 0;
		if (window.innerWidth < 768) startAutoScroll();
	}

	onMount(() => {
		if (window.innerWidth < 768) startAutoScroll();
		window.addEventListener('resize', handleResize);
	});

	onDestroy(() => {
		stopAutoScroll();
		window.removeEventListener('resize', handleResize);
	});
</script>

<Meta title="About" description="CAIT" type="site" />


<section class="col-span-full" aria-label="About me page heading">
	<h1 class="font-extrabold lg:font-bold md:text-2xl lg:text-3xl xl:text-4xl mt-20">About</h1>
</section>

<main class="col-span-full flex flex-col gap-10 mb-20">

	<div class="flex flex-col md:flex-row gap-4 justify-between items-center">
		<img src="/images/about/cait_logo_big.png" alt="CAIT logo"
			 class="w-3/4 md:w-1/4 rounded-lg order-1 md:order-2 self-center md:self-auto"/>

		<div class="flex flex-col justify-between gap-4 order-2 md:order-1">
			<p class="text-surface-700 dark:text-surface-200">
				<b>The Community Archive for Integrated Teaching (CAIT)</b> is a platform where educators from any
				discipline can share, discover, and collaborate on teaching materials. From slides and lecture
				notes to assignments and full courses, CAIT makes it easy to browse materials by topic, audience,
				or content type, and to adapt resources for your own teaching. Every resource can be refined through feedback,
				proposed changes, and collaborative editing, building a culture of transparency, peer support, and continuous improvement.
			</p>

			<p class="text-surface-700 dark:text-surface-200">
				CAIT began in 2023 within the Machine Learning Teachers Community at TU Delft, where a group
				of lecturers saw the need for more collaboration in developing Artificial Intelligence and Machine Learning
				course materials. This idea quickly grew into a cross-faculty working group with 10 educators from 6 TU Delft
				faculties and Erasmus University, led by
				<a href="https://www.tudelft.nl/en/staff/b.giovanardi/" target="_blank" class="text-blue-500 underline">Bianca Giovanardi</a> (Department of Aerospace Structures and Materials)
				and <a href="https://tomviering.nl/" target="_blank"  class="text-blue-500 underline">Tom Viering</a> (Department of Intelligent Systems).
				Together, they defined the platform’s requirements,
				which were brought to life by Praxidike, a team of TU Delft students,
				during the CSE2000 Software Project course in summer 2024.
			</p>
			<p class="text-surface-700 dark:text-surface-200">
				The initiative is funded by <a href="https://convergence.nl/" target="_blank" class="text-blue-500 underline">Convergence</a>
				and the <a href="https://www.tudelft.nl/en/open-science/community" target="_blank" class="text-blue-500 underline">Open Science Community Delft</a>.
			</p>
			<p class="text-surface-700 dark:text-surface-200">
				<b>CAIT is built for the community—so your ideas matter! Share your feedback at 	<a href="mailto:cait-ewi@tudelft.nl" class="text-blue-500 underline" target="_blank"><i>cait-ewi@tudelft.nl</i></a>
					or request new features through our
					<a href="https://docs.google.com/forms/d/e/1FAIpQLSfB_sNXSN1K-pun8c_wJDsEvVWxl9XShATj04fVpAyXiJT-9A/viewform" target="_blank"
					   class="text-blue-500 underline">
						form </a>. Help us make CAIT a space where educators can build better teaching, together. </b>
			</p>
		</div>
	</div>

	<div class="mt-6">
		<div class="md:hidden">
			<div
				bind:this={sponsorContainer}
				role="list"
				class="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory -mx-4 px-4 hide-scrollbar">
				<div role="listitem" class="flex-shrink-0 w-full snap-center flex justify-center">
					<img src="/images/about/OSCDLogo.png" alt="Open Science Community Delft logo"
						 class="rounded-lg object-contain h-40"/>
				</div>
				<div role="listitem" class="flex-shrink-0 w-full snap-center flex justify-center">
					<img src="/images/about/convergence_logo_rgb.jpg" alt="Convergence Logo"
						 class="rounded-lg object-contain h-40"/>
				</div>
				<div role="listitem" class="flex-shrink-0 w-full snap-center flex justify-center">
					<img src="/images/about/TUDelft_logo_cmyk.png" alt="TUDelft logo"
						 class="rounded-lg object-contain h-40"/>
				</div>
			</div>
		</div>

		<div class="hidden md:flex flex-row justify-center gap-10">
			<img src="/images/about/OSCDLogo.png" alt="Open Science Community Delft logo" class="rounded-lg object-contain h-40"/>
			<img src="/images/about/convergence_logo_rgb.jpg" alt="Convergence Logo" class="rounded-lg object-contain h-40"/>
			<img src="/images/about/TUDelft_logo_cmyk.png" alt="TUDelft logo" class="rounded-lg object-contain h-40"/>
		</div>
	</div>

</main>

<style>
/* Hide the scrollbar / visual swipe indicator for the mobile carousel */
.hide-scrollbar {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}
.hide-scrollbar::-webkit-scrollbar {
  display: none; /* Chrome, Safari */
}
</style>

