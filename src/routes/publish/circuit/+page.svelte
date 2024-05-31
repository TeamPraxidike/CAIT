<script lang="ts">
	import { Circuit, Meta } from '$lib';

	let circuitRef : InstanceType<typeof Circuit>;

	// Function to handle the button click
	function handlePublishClick() {
		if (circuitRef) {
			console.log(circuitRef.publishCircuit());
		}
	}
</script>

<!--<Node></Node>-->
<Meta title="Publish Circuit" description="Organize publications into a circuits" type="site" />
<button class="rounded-lg px-2 py-1 bg-primary-500 text-surface-50" on:click={handlePublishClick}>Publish Circuit</button>
<!--<div class="col-span-9 h-[256px]"><CircuitManual isDraggable="{true}"/></div>-->
<Circuit nodes="{[]}" bind:this = {circuitRef} publishing="{true}"/>
<!--<CircuitPureHTML/>-->
