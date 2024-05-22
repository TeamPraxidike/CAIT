<script>
	import { Meta, Circuit, CircuitPureHTML } from '$lib';
	import Node from '$lib/components/circuits/Node.svelte';


</script>

<!--<Node></Node>-->
<Meta title="Publish Circuit" description="Organize publications into a circuits" type="site" />
<!--<div class="col-span-9 h-[256px]"><CircuitManual isDraggable="{true}"/></div>-->
<Circuit  nodes="{[]}" publishing="{true}"/>
<!--<CircuitPureHTML/>-->
