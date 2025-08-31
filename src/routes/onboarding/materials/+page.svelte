<script lang="ts">
	import { fade } from 'svelte/transition';
	import { Meta } from '$lib';
	import { Step, Stepper } from '@skeletonlabs/skeleton';
	import { goto } from '$app/navigation';

	let showWelcome = true;

	// GIF sources
	const stepGifs: { [key: number]: string } = {
		0: '/images/onboarding/step1_upload.gif',
		1: '/images/onboarding/step2_title.gif',
		2: '/images/onboarding/step3_metadata.gif',
		3: '/images/onboarding/step4_review.gif'
	};

	const stepTitles = [
		'Upload Your Files',
		'Add Title and Basic Info',
		'Fill Meta Information', 
		'Review and Publish'
	];

	const stepDescriptions = [
		'Drag and drop files or click to browse. You can also add links!',
		'Give your material a compelling title, select the appropriate content type, and choose the right course',
		'Add learning objectives, prerequisites, tags, and other metadata',
		'Review all your information before publishing'
	];

	const onNextHandler = () => {
		window.scrollTo({
			top: 0,
			behavior: 'smooth'
		});
	};

	const startOnboarding = () => {
		showWelcome = false;
	};

	const finishOnboarding = () => {
		goto('/publish/materials');
	};

	const skipOnboarding = () => {
		goto('/');
	};
</script>

<Meta title="Materials Upload Tutorial" description="Learn how to upload educational materials to CAIT" type="site" />

{#if showWelcome}
	<!-- Welcome Screen -->
	<div class="col-span-full min-h-screen flex items-center justify-center" in:fade={{duration: 400}}>
		<div class="max-w-2xl mx-auto text-center px-6">
			<div class="mb-8">
				<img src="/images/about/CAIT_Logo_nobg.png" alt="CAIT Logo" class="w-32 h-32 mx-auto mb-6">
			</div>
			
			<h1 class="text-4xl font-bold text-surface-900 dark:text-surface-100 mb-4">
				Materials Upload Tutorial
			</h1>
			
			<p class="text-xl text-surface-700 dark:text-surface-300 mb-8">
				Learn how to upload and publish your educational materials on CAIT
			</p>
			
			<div class="flex flex-col sm:flex-row gap-4 justify-center">
				<button 
					type="button" 
					class="btn bg-primary-600 text-white hover:bg-primary-700 px-8 py-3 text-lg"
					on:click={startOnboarding}
				>
					Start Tutorial
				</button>
				
				<button 
					type="button" 
					class="btn bg-surface-200 dark:bg-surface-700 text-surface-800 dark:text-surface-200 hover:bg-surface-300 dark:hover:bg-surface-600 px-8 py-3 text-lg"
					on:click={skipOnboarding}
				>
					Skip for Now
				</button>
			</div>
			
			<p class="text-sm text-surface-500 dark:text-surface-400 mt-6">
				This tutorial takes about 3 minutes to complete
			</p>
		</div>
	</div>
{:else}
	<!-- Onboarding Stepper -->
	<div class="col-span-full px-5 pt-5 pb-5" out:fade={{duration: 400}}>
		<div class="max-w-6xl mx-auto">
			<!-- Header -->
			<div class="text-center mb-8">
				<h1 class="text-3xl font-bold text-surface-900 dark:text-surface-100 mb-2">
					Materials Upload Tutorial
				</h1>
				<p class="text-surface-600 dark:text-surface-400">
					Learn how to upload educational materials to CAIT
				</p>
			</div>

			<!-- Stepper -->
			<Stepper 
				on:step={onNextHandler}
				buttonBackLabel="← Back"
				buttonBack="btn text-surface-800 border border-surface-600 bg-surface-200 dark:text-surface-50 dark:bg-surface-600"
				buttonNextLabel="Next →"
				buttonNext="btn text-surface-50 bg-primary-600 dark:text-surface-50 dark:bg-primary-600"
				buttonCompleteLabel="Upload My Materials!"
				buttonComplete="btn text-surface-50 bg-success-600 dark:text-surface-50 dark:bg-success-600"
				on:complete={finishOnboarding}
			>
				{#each stepTitles as title, index}
					<Step locked={false}>
						<svelte:fragment slot="header">
							<span class="text-lg font-semibold">{title}</span>
						</svelte:fragment>
						
						<div class="grid grid-cols-1 lg:grid-cols-4 gap-8 items-center">
							<!-- Content Description -->
							<div class="order-2 lg:order-1 lg:col-span-2">
								
								<p class="text-surface-600 dark:text-surface-400 mb-6 leading-relaxed">
									{stepDescriptions[index]}
								</p>

								<!-- Step-specific tips -->
								<div class="bg-surface-100 dark:bg-surface-800 rounded-lg p-4 border-l-4 border-primary-500">
									<h4 class="font-semibold text-surface-800 dark:text-surface-200 mb-2">
										💡 Tips:
									</h4>
									<ul class="text-sm text-surface-600 dark:text-surface-400 space-y-1">
										{#if index === 0}
											<li>• Supported formats: .pdf, .pptx, .png, .jpg, .mp4</li>
											<li>• The files are stored securely</li>
										{:else if index === 1}
											<li>• Pick one of your own courses from the list or add a new one</li>
											<li>• You can also search for someone else's course!</li>
										{:else if index === 2}
											<li>• Tags make your content easier to find</li>
											<li>• Add collaborators as maintainers for shared ownership</li>
										{:else if index === 3}
											<li>• Not ready yet? Save as a draft and come back later</li>
										{/if}
									</ul>
								</div>
							</div>
							
							<!-- GIF/Demo -->
							<div class="order-1 lg:order-2 lg:col-span-2">
								<div class="bg-white dark:bg-surface-800 rounded-lg shadow-lg overflow-hidden">
									<img 
										src={stepGifs[index]} 
										alt="Step {index + 1} demonstration"
										class="w-full h-auto"
										loading="lazy"
									>
								</div>
							</div>
						</div>
					</Step>
				{/each}
			</Stepper>
			
			<!-- Footer actions -->
			<div class="flex justify-between items-center mt-8 pt-6 border-t border-surface-300 dark:border-surface-700">
				<button 
					type="button" 
					class="text-surface-700 hover:bg-surface-100 font-semibold py-2 px-4 rounded-xl transition"
					on:click={skipOnboarding}
				>
					Skip Tutorial
				</button>
				
				<p class="text-sm text-surface-500 dark:text-surface-400">
					Need help? Contact us at <a href="mailto:cait-ewi@tudelft.nl" class="text-primary-600 hover:text-primary-700 underline">cait-ewi@tudelft.nl</a>
				</p>
			</div>
		</div>
	</div>
{/if}

<style>
	/* Mobile responsiveness for the demo images */
	@media (max-width: 1024px) {
		.order-1 {
			order: 1;
		}
		.order-2 {
			order: 2;
		}
	}
</style>
