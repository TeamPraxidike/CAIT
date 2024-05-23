<script lang="ts">
	import { onMount } from 'svelte';
	import cytoscape from 'cytoscape';
	import type { Node as PrismaNode, Publication } from '@prisma/client';
	import SearchElems from '$lib/components/circuits/SearchElems.svelte';

	//	import cytoscapeNodeHtmlLabel from 'cytoscape-node-html-label';



	//cytoscapeNodeHtmlLabel(cytoscape);

	interface Edge {
		data: { id: string, source: string, target: string };
	}

	export let publishing: boolean;


	export let nodes: (PrismaNode & {
		publication: Publication
		next: PrismaNode[]
	})[]; //GET all nodes in the circuit
	 let edges : Edge[];
	let cy: any;

	let mappedNodes = nodes.map(node => ({
		data: { id: node.id.toString(), title: node.publication.title },
		position: { x: node.posX, y: node.posY }
	}));
	nodes.forEach(node => {
		let curNext = node.next.map(nextNode => ({
			data: {
				id: node.id.toString().concat(nextNode.id.toString()),
				source: node.id.toString(),
				target: nextNode.id.toString()
			}
		}));
		edges.push(...curNext);
	});


	onMount(() => {

		// Initialize Cytoscape
		cy = cytoscape({
			container: document.getElementById('cy'),
			elements: [
				...mappedNodes
				//	...edges
			],
			style: [
				{
					selector: 'node',
					style: {
						'width': '100px',
						'height': '60px',
						'shape': 'round-rectangle',
						'background-color': '#F9F9FA',
						'border-width' : '1px',
						'border-color' : '#0088AD',
						'color': '#4C4C5C',
						'font-size': '10px',
						'text-valign': 'center',
						'text-halign': 'center',
						'label': 'data(label)',
					},
				},


				{
					selector: 'edge',
					style: {

						'width': 2,
						'line-color': '#646478',
						'curve-style' : 'bezier',
						'target-arrow-color': '#646478',
						'target-arrow-shape': 'triangle',
					},
				},
			],
			layout: {
				name: 'preset'
			},
		});

		// Apply HTML labels to nodes
		// cy.nodeHtmlLabel([
		// 	{
		// 		query: 'node',
		// 		tpl: function(data : any) {
		// 			return `<div class="node-content">
		//                 <div class="node-title">${data.id}</div>
		//                 <div class="node-icons">
		//                   <svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 24 24"><path d="M2 3h8a2 2 0 0 1 2-2a2 2 0 0 1 2 2h8v2h-1v11h-5.75L17 22h-2l-1.75-6h-2.5L9 22H7l1.75-6H3V5H2zm3 2v9h14V5z"/></svg>
		//                   <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24"><path d="M2 3h8a2 2 0 0 1 2-2a2 2 0 0 1 2 2h8v2h-1v11h-5.75L17 22h-2l-1.75-6h-2.5L9 22H7l1.75-6H3V5H2zm3 2v9h14V5z"/></svg>
		//                   <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24"><path d="M2 3h8a2 2 0 0 1 2-2a2 2 0 0 1 2 2h8v2h-1v11h-5.75L17 22h-2l-1.75-6h-2.5L9 22H7l1.75-6H3V5H2zm3 2v9h14V5z"/></svg>
		//                 </div>
		//               </div>`;
		// 		}
		// 	}
		// ]);

		// cy.nodeHtmlLabel([
		// 	{
		// 		query: 'node',
		// 		tpl: function (data : any) {
		// 			const nodeId = `node-${data.id}`;
		// 			return `<div id="${nodeId}" class="node-content"></div>`;
		// 		}
		// 	}
		// ]);
		//
		// cy.nodes().forEach((node: any) => {
		// 	const nodeId = `node-${node.id()}`;
		// 	new Node({
		// 		target: document.getElementById(nodeId),
		// 		props: {
		// 			data: node.data()
		// 		}
		// 	});
		// });


		cy.on('click', 'node', (event: any) => {
			alert("node clicked" + event.target.id())
		});

		cy.on('mouseover', 'node', (event: any) => {
			const node = event.target;
			node.style({
				'background-color': '#4C4C5C',
				'color': '#F9F9FA',
				'cursor': 'pointer'
			});
		});

		cy.on('mouseout', 'node', (event: any) => {
			const node = event.target;
			node.style('background-color', '#FCFCFD');
			node.style('color', '#4C4C5C');
		});

		if (!publishing)
			cy.nodes().forEach((node: any) => {
					if (node)
						node.lock()
			});
	});


	let addActive: boolean = false;
	let displayedMaterials: any = [];
	let selectedIds: Set<number> = new Set();
	//const addElements = () => addingActive = !addingActive
	const fetchElements = async () => {

		await fetch('/api/material')
			.then(response => {
				if (!response.ok) {
					throw new Error('Network response was not ok');
				}
				return response.json();
			})
			.then(data => {
				// Handle the response data from the API
				displayedMaterials = data;
				addActive = true;
			})
			.catch(error => {
				console.error('There was a problem with the fetch operation:', error);
			});
	};

	const addNode = async (event: CustomEvent) => {
		let pubId = event.detail.id;

		await fetch(`/api/material/${pubId}`)
			.then(response => {
				if (!response.ok) {
					throw new Error('Network response was not ok');
				}
				return response.json();
			})
			.then(data => {
				cy.add({
					group: 'nodes',
					data: { id: data.material.publication.id, label: data.material.publication.title },
					position: { x: 100, y: 100 }
				});
			})
			.catch(error => {
				console.error('There was a problem with the fetch operation:', error);
			});
	};

	const removeNode = (event: CustomEvent) => {
		cy.remove(cy.$(`#${event.detail.id}`));
	};


</script>

<style>
    #cy {
        width: 800px;
        height: 600px;
        border: 1px solid black;
    }
    :global(.node-content) {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        width: 90px;
        height: 90px;
        text-align: center;
        background-color: #666;
        color: white;
        border-radius: 5px;
        padding: 5px;
        box-sizing: border-box;
        overflow: hidden;
    }

    :global(.node):hover{
        background-color: #770000;
        color: white;
    }
    :global(.node-title) {
        font-size: 14px;
        font-weight: bold;
    }
    :global(.node-icons) {
        display: flex;
        justify-content: center;
    }
    :global(.node-icons svg) {
        width: 15px;
        height: 15px;
        margin: 0 2px;
        fill: #7ee787;
    }
</style>
<button class="btn variant-filled h-1/2" on:click={fetchElements}>Add</button>

<div id="cy"></div>


{#if addActive}
	<div>
		<SearchElems bind:addActive={addActive} bind:selectedIds={selectedIds} bind:materials={displayedMaterials}
								 on:selFurther={addNode} on:remFurther={removeNode} />
	</div>
{/if}




