<script>
	import { Meta } from '$lib';
	import Node from '$lib/components/circuits/Node.svelte';
	import Circuit from '$lib/components/circuits/Circuit.svelte';
</script>

<Meta title="Publish Circuit" description="Organize publications into a circuits" type="site" />
<h1>Publish Circuit</h1>
<div class = "col-span-full mt-64 mb-64"><Node name = "Presentation"></Node></div>
<div class="col-span-full h-64"><Circuit></Circuit></div>
