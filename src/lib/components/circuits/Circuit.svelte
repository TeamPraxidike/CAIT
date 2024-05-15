<script lang="ts">
	import cytoscape from 'cytoscape';
	import { onMount } from 'svelte';

	//export let nodes:string[] = ['Node1', 'Node2', 'Node3', 'Node4', 'Node5']

	let cy;
	let container : HTMLDivElement


	function generateDots(rows:number, cols:number) {
		const rowGap = container.offsetHeight / rows;
		const colGap = container.offsetWidth / cols;

		for (let row = 0; row < rows; row++) {
			for (let col = 0; col < cols; col++) {
				const dot = document.createElement('div');
				dot.classList.add('dot', 'absolute', 'bg-surface-400', 'rounded-full');
				dot.style.width = `1.5px`;
				dot.style.height = `1.5px`;
				dot.style.left = `${col * colGap}px`;
				dot.style.top = `${row * rowGap}px`;
				container.appendChild(dot);
			}
		}
	}
	onMount(() => {
		generateDots(50, 50)
		cy = cytoscape({
			container: container,
			elements: [
				{ data: { id: 'node1' } },
				{ data: { id: 'node2' } },
				{ data: { id: 'node3' } },
				{ data: { id: 'node4' } },
				{ data: { id: 'edge1', source: 'node1', target: 'node2' } },
				{ data: { id: 'edge2', source: 'node2', target: 'node3' } },
				{ data: { id: 'edge3', source: 'node1', target: 'node3' } },
				{ data: { id: 'edge3', source: 'node1', target: 'node4' } },
			],
			style: [
				{
					selector: 'node',
					style: {
						'content': 'data(id)',
						'text-valign': 'center',
						'text-halign': 'center'
					}
				},
				{
					selector: 'edge',
					style: {
						'curve-style': 'bezier',
						'target-arrow-shape': 'triangle'
					}
				}
			]
		});


		// Render Svelte components for custom nodes
		// document.querySelectorAll('.cy-node').forEach(nodeElement => {
		// 	const id = nodeElement.getAttribute('data-id');
		// 	const NodeComponent = new Node({ target: nodeElement, props: { id } });
		// });
	});



</script>


<div bind:this = "{container}" class="w-full h-full"></div>

