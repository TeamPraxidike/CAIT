<script lang="ts">
	import { onMount } from 'svelte';
	import cytoscape from 'cytoscape';
	import type { Node as PrismaNode, Publication } from '@prisma/client';
	import SearchElems from '$lib/components/circuits/SearchElems.svelte';
	import type { FetchedFileArray } from '$lib/database';

	//	import cytoscapeNodeHtmlLabel from 'cytoscape-node-html-label';



	//cytoscapeNodeHtmlLabel(cytoscape);

	interface Edge {
		data: { id: string, source: string, target: string };
	}

	export let publishing: boolean;


	// export let nodes: (PrismaNode & {
	// 	publication: Publication
	// 	next: PrismaNode[]
	// })[]; //GET all nodes in the circuit
	 let edges : Edge[];
	let cy: any;
	let selected: boolean = false;
	let selectedId: string = '';
	let prereqActive: boolean = false;
	let nodeClicked: boolean = false;

	// let mappedNodes = nodes.map(node => ({
	// 	data: { id: node.id.toString(), title: node.publication.title },
	// 	position: { x: node.posX, y: node.posY }
	// }));
	// nodes.forEach(node => {
	// 	let curNext = node.next.map(nextNode => ({
	// 		data: {
	// 			id: node.id.toString().concat(nextNode.id.toString()),
	// 			source: node.id.toString(),
	// 			target: nextNode.id.toString()
	// 		}
	// 	}));
	// 	edges.push(...curNext);
	// });


	onMount(() => {

		// Initialize Cytoscape
		cy = cytoscape({
			container: document.getElementById('cy'),
			elements: [
				//  ...mappedNodes
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
						'curve-style': 'bezier',
						'width': 2,
						'line-color': '#646478',
						'target-arrow-color': '#646478',
						'target-arrow-shape': 'triangle',
					},
				},
			],
			layout: {
				name: 'preset'
			},
		});


		cy.on('select', 'node', (event: any) => {
			console.log('Selected: ' + event.target.data().label);
			let node = event.target;
			node.style({
				'background-color': '#4C4C5C',
				'color': '#F9F9FA'
			});


			if (selected && prereqActive) {
				let edgeId = 'e'.concat(node.id().toString().concat(selectedId.toString()));
				if (cy.getElementById(edgeId).length > 0) {
					cy.remove(cy.$(`#${edgeId}`));
				} else {
					const edge = cy.add({
						group: 'edges',
						data: { id: `${edgeId}`, source: `${node.id()}`, target: `${selectedId}` }
					});
				}

				cy.$(`#${node.id()}`).unselect();
				selected = false;
				cy.$(`#${selectedId}`).select();
			} else {

				if (prereqActive) {
					cy.edges().forEach((edge: any) => {
						if (edge.target().id() === selectedId) {
							edge.source().style({
								'background-color': '#9E9EAE',
								'color': '#F9F9FA'
							});
						}
					});

				}
				selected = true;
				selectedId = node.id();

			}
			nodeClicked = false;
		});

		/**
		 * Deals with the unselecting of nodes. Restores the background
		 * of every node in case more have been coloured
		 */
		cy.on('unselect', 'node', (event: any) => {
			console.log('Unselected: ' + event.target.data().label);
			//let node = event.target;
			cy.nodes().forEach((n: any) => {
				n.style({
					'background-color': '#FCFCFD',
					'color': '#4C4C5C'
				});
			});


			if (!nodeClicked) {
				prereqActive = false;
			}
			if (!prereqActive) {
				selected = false;
				selectedId = '';
			}

		});

		/**
		 * Updates that a node has been clicked as the order in which events are executed
		 * is Click -> Unselect -> Selected. This is needed to make sure that node is properly unselected.
		 */
		cy.on('click', 'node', (event: any) => {
			const nodeId = event.target.id();
			const node = event.target;
			console.log('clicked');
			if (selectedId !== nodeId) {
				nodeClicked = true;
			}
		});


		/**
		 * Same as the above but activated on tap for mobile
		 */
		cy.on('tap', 'node', (event: any) => {
			const nodeId = event.target.id();
			const node = event.target;
			console.log('clicked');
			if (selectedId !== nodeId) {
				nodeClicked = true;
			}
		});

		/**
		 * The two methods below are used to simulate hover effect on a node
		 */
		cy.on('mouseover', 'node', (event: any) => {
			const node = event.target;
			if (!node.selected() && !prereqActive) {
				console.log("Here")
				node.style({
					'background-color': '#4C4C5C',
					'color': '#F9F9FA'
				});
			}
		});


		cy.on('mouseout', 'node', (event: any) => {
			const node = event.target;
			if (!node.selected() && !prereqActive) {
				node.style({
					'background-color': '#FCFCFD',
					'color': '#4C4C5C'
				});
			}
		});

		/**
		 * Locks all nodes if not in editing mode making it impossible to move them
		 */
		if (!publishing)
			cy.nodes().forEach((node: any) => {
					if (node)
						node.lock()
			});
	});


	let addActive: boolean = false;
	let displayedMaterials: any = [];
	let fileData : FetchedFileArray = []
	let selectedIds: Set<number> = new Set();

	/**
	 * Fetches all materials
	 */
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
				displayedMaterials = data.materials;
				fileData = data.fileData
				addActive = true;
			})
			.catch(error => {
				console.error('There was a problem with the fetch operation:', error);
			});
	};

	/**
	 * Adds a node selected from the browsing page
	 * @param event -> Custom event dispatched from the browsing page containing the publication's id
	 */
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

	/**
	 * Removes a node through the browsing page
	 * @param event -> event activated from the browsing page
	 */
	const removeNode = (event: CustomEvent) => {
		cy.remove(cy.$(`#${event.detail.id}`));
		selectedId = '';
		selected = false;
		selectedIds.delete(event.detail.id);
	};

	/**
	 * Removes the selected node
	 */
	const removeSelected = () => {
		cy.remove(cy.$(`#${selectedId}`));
		selectedIds.delete(Number(selectedId));
		selectedId = '';
		selected = false;

	};

	/**
	 * Highlights all prerequisites of the selected node and activates the ability to add edges
	 */
	const addPrereq = () => {
		cy.edges().forEach((edge: any) => {
			if (edge.target().id() === selectedId) {
				edge.source().style({
					'background-color': '#9E9EAE',
					'color': '#F9F9FA'
				});
			}
		});
		prereqActive = true;
	};

	/**
	 * Saves the progress so far and unselects the node
	 */
	const savePrereq = () => {
		prereqActive = false;
		cy.$(`#${selectedId}`).unselect();
	};

</script>

<style>
    #cy {
        width: 800px;
        height: 600px;
        border: 1px solid black;
    }
</style>
<div class="flex-col gap-4">
	<div class="flex gap-2">
		{#if !selected}
			<button class="btn variant-filled" on:click={fetchElements}>Add</button>
		{/if}
		{#if selected}
			{#if prereqActive}
				<button class="btn variant-filled bg-surface-600" on:click={savePrereq}>Save Changes</button>
			{:else}
				<button class="btn variant-filled bg-surface-600" on:click={addPrereq}>Select Prerequisites</button>
			{/if}
			<button class="btn variant-filled bg-error-400" on:click={removeSelected}>Remove From Circuit</button>
		{/if}
	</div>


	<div id="cy"></div>
</div>


{#if addActive}
	<div>
		<SearchElems bind:addActive={addActive} bind:selectedIds={selectedIds} bind:materials={displayedMaterials}
								 bind:fileData={fileData}
								 on:selFurther={addNode} on:remFurther={removeNode} />
	</div>
{/if}




