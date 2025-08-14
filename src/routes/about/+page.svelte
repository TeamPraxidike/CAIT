<script lang="ts">
	import { Meta, Section } from '$lib';
	const initiative = 'This initiative was started by the ML teacher community at TU Delft in their attempt to increase collaboration between different lecturers in their preparation for their courses. This platform was developed to facilitate sharing machine learning education materials between TU Delft teachers. We are looking for feedback to improve this platform and make it useful for you!';

</script>

<Meta title="About" description="CAIT" type="site" />


<section class="col-span-full" aria-label="About me page heading">
	<h1 class="font-extrabold lg:font-bold md:text-2xl lg:text-3xl xl:text-4xl mt-20">About</h1>
	<h2>Community for AI Teachers: Contribute and search for lecture materials, assignments, exam questions and more!</h2>
</section>

<main class="col-span-full flex flex-col gap-10 mb-20">
<!--	<Section title="CAIT Initiative" description={initiative} subtitle="How it started" onAbout={true} img="/images/about/cait_logo_big.png"/>-->

	<div class="flex flex-row gap-4 justify-between items-center">
		<div>
			<p class="text-surface-700 dark:text-surface-200 mb-5">
				<b>The Community Archive for Integrated Teaching (CAIT)</b> is a platform where educators from any
				discipline can share, discover, and collaborate on teaching materials. From slides and lecture
				notes to assignments and full courses, CAIT makes it easy to browse materials. by topic, audience,
				or content type—and to adapt resources for your own teaching. Every resource can be refined through feedback,
				proposed changes, and collaborative editing, building a culture of transparency, peer support, and continuous improvement.
			</p>

			<p class="text-surface-700 dark:text-surface-200">
				CAIT began in 2023 within the Machine Learning Teachers Community at TU Delft, where a group
				of lecturers saw the need for more collaboration in developing Artificial Intelligence and Machine Learning
				course materials. This idea quickly grew into a cross-faculty working group with 10 educators from 6 TU Delft
				faculties and Erasmus University, led by Bianca Giovanardi (Department of Aerospace Structures and Materials)
				and Tom Viering (Department of Intelligent Systems). Together, they defined the platform’s requirements,
				which were brought to life by Praxidike, a team of TU Delft students,
				during the CSE2000 Software Project course in summer 2024
			</p>
		</div>

		<img src="/images/about/cait_logo_big.png" alt="CAIT logo" class="md:w-1/3 rounded-lg "/>
	</div>
	<p class="text-surface-700 dark:text-surface-200">
		The initiative is funded by Convergence and the Open Science Community Delft.
	</p>

</main>
