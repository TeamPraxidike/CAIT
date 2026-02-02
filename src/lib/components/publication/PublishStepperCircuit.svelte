<script lang="ts">
	import TitleStep from '$lib/components/publication/publish/TitleStep.svelte';
	import MetaInfoStep from '$lib/components/publication/publish/MetaInfoStep.svelte';
	import Preview from '$lib/components/publication/publish/Preview.svelte';
	import UploadFilesForm from '$lib/components/publication/UploadFilesForm.svelte';
	import { Step, Stepper } from '@skeletonlabs/skeleton';
	import { changeCourse } from '$lib/util/coursesLogic.ts';
	import { downloadFileFromSupabase } from '$lib/util/file.ts';
	import type {
		ParamsImmutable,
		ParamsMutable,
		ParamsMutableCircuit
	} from '$lib/util/frontendTypes.ts';
	import { SvelteFlowProvider } from '@xyflow/svelte';
	import { CircuitComponent } from '$lib';
	import type { NodeInfo } from '$lib/components/circuits/methods/CircuitTypes.ts';
	import { isUndefinedType } from 'eslint-plugin-svelte/lib/utils/ts-utils';

	export let data: ParamsMutable;
	export let dataCircuit: ParamsMutableCircuit | null;
	export let paramsImmutable: ParamsImmutable;

	export let draft: boolean;
	export let markedAsDraft: boolean;
	// export let edit: boolean;

	if (!dataCircuit) {
		dataCircuit = {
			circuitData: {numNodes: 0, add: [], delete: [], edit: [], next: []},
			coverPic: undefined
		};
	}

	let circuitNodesPlaceholder: NodeInfo[] = [];
	$: circuitNodesPlaceholder = circuitNodesPlaceholder;

	let circuitRef : InstanceType<typeof CircuitComponent>;
	$: circuitRef = circuitRef;


	const onNextHandler = async (event: CustomEvent) => {
		window.scrollTo({
			top: 0,
			behavior: 'smooth'
		});
		if (event.detail.step === 0) {
			let { nodeDiffActions, coverPic } = await circuitRef.publishCircuit();

			dataCircuit.circuitData = nodeDiffActions;
			dataCircuit.coverPic = coverPic;
		}
	}

</script>

<Stepper on:submit={() => data.isSubmitting=true} buttonCompleteType="submit" on:step={onNextHandler}
		 buttonBackLabel="← Back"
		 buttonBack="btn text-surface-800 border border-surface-600 bg-surface-200 dark:text-surface-50 dark:bg-surface-600"
		 buttonNextLabel="Next →"
		 buttonNext="btn text-surface-50 bg-primary-600 dark:text-surface-50 dark:bg-primary-600"
		 buttonCompleteLabel="Complete"
		 buttonComplete="btn text-surface-50 bg-primary-600 dark:text-surface-50 dark:bg-primary-600">
	<Step>
		<svelte:fragment slot="header">{"Create circuit"}<span class="text-error-300">*</span></svelte:fragment>

		<!--			<svelte:fragment slot="header">Upload files<span class="text-error-300">*</span></svelte:fragment>-->
		<!--{#key circuitKey}-->
		<SvelteFlowProvider>
			<CircuitComponent bind:dbNodes={circuitNodesPlaceholder} bind:this={circuitRef} publishing="{true}" bind:liked="{paramsImmutable.liked}" bind:saved={paramsImmutable.saved}/>
		</SvelteFlowProvider>
		<!--{/key}-->


	</Step>
	<Step>
		<svelte:fragment slot="header">Give your publication a title</svelte:fragment>
		<label for="title" class="block font-medium">Title<span class="text-error-300">*</span></label>
		<input type="text" name="title" placeholder="Title" bind:value={data.title}
			   class="rounded-lg dark:bg-surface-800 bg-surface-50 w-full text-surface-700 dark:text-surface-400 focus:border-primary-500 focus:ring-0">

	</Step>
	<Step>
		<svelte:fragment slot="header">Fill in meta information</svelte:fragment>
		<MetaInfoStep bind:data={data}
					  dataMaterial={null}
					  paramsImmutable={paramsImmutable}/>
	</Step>
	<Step locked={data.isSubmitting}>
		<svelte:fragment slot="header">Review</svelte:fragment>
		<Preview
			bind:data={data}
			dataMaterial={null}
			paramsImmutable={paramsImmutable}
			bind:draft={draft}
			bind:markedAsDraft={markedAsDraft}
		/>

	</Step>
</Stepper>