<script lang="ts">
	import { writable } from 'svelte/store';
	import { Background, Controls, MiniMap, SvelteFlow,  type Edge, type Node, type OnConnectEnd } from '@xyflow/svelte';

	import '@xyflow/svelte/dist/style.css';
	import NodeTemplate from '$lib/components/circuits/NodeTemplate.svelte';
	import type { CircuitNode} from '$lib/components/circuits/CircuitTypes';
	import { onMount } from 'svelte';
	import { PublicationType } from '@prisma/client';

	export let liked: number[] = [];
	export let saved: number[] = [];
	export let publishing: boolean;

	export let publishingView = false;
	export let dbNodes: CircuitNode[];

	const nodes = writable<Node[]>([]);

	const edges = writable<Edge[]>([]);

	const nodeTypes = {
		'custom': NodeTemplate
	};

	onMount(async () => {
		dbNodes.forEach(node => {
			$nodes.push({
				id: node.publication.id.toString(),
				data: { label: node.publication.title, extensions: node.extensions, isMaterial: node.publication.type === PublicationType.Material, dummyNode: false, selected:false},
				position: { x: node.posX, y: node.posY },
				type: "custom"
			});
		});

		let repEdges: string[] = [];
		dbNodes.forEach(node => {
			node.next.forEach(nextNode => {
				const id = `en${node.publicationId}n${nextNode.toPublicationId.toString()}`;
				if (!repEdges.includes(id)) {
					repEdges.push(id);
					$edges.push({
						id: id,
						source: node.publicationId.toString(),
						target: nextNode.toPublicationId.toString()
					});
				}
			});
		});

		$nodes = $nodes;
		$edges = $edges;
	});

</script>

<div style:height="100vh">
	<SvelteFlow {nodes} {edges} {nodeTypes} fitView>
		<Controls />
		<Background />
		<MiniMap />
	</SvelteFlow>
</div>