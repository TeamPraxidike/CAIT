<script lang="ts">
	import { onMount } from 'svelte';
	import cytoscape from 'cytoscape';
	import SearchElems from '$lib/components/circuits/SearchElems.svelte';
	import type { FetchedFileArray, NodeDiffActions } from '$lib/database';
	import type { ModalSettings, PopupSettings } from '@skeletonlabs/skeleton';
	import { getModalStore } from '@skeletonlabs/skeleton';
	import type { Node as PrismaNode, Publication } from '@prisma/client';
	import nodeHtmlLabel from 'cytoscape-node-html-label'
	//import cytoscapeHTML from 'cytoscape-html';
	import { popup } from '@skeletonlabs/skeleton';
	import Node from './Node.svelte';

	nodeHtmlLabel(cytoscape)

	const popupHoverPub: PopupSettings = {
		event: 'hover',
		target: 'popupHoverPub',
		placement: 'top'
	};
	const modalStore = getModalStore();
	//	import cytoscapeNodeHtmlLabel from 'cytoscape-node-html-label';

	type Edge = {
		data: {
			id: string,
			source: string,
			target: string
		}
	}

	//cytoscapeNodeHtmlLabel(cytoscape);
	export let publishing: boolean;


	export let nodes: (PrismaNode & {
		publication: Publication
		next: {
			circuitId: number,
			fromPublicationId: number,
			toPublicationId: number
		}[]
	})[] = [];

	const htmlRender = (publication : Publication) => {
		return `<div class="node-content"><div use:popup="{${popupHoverPub}" class="{display} bg-surface-50 border border-primary-500 w-[100px] h-[60px] rounded-lg flex flex-col items-center justify-center gap-1">
	<p class="text-surface-700 self-center"> ${publication.title}</p>
	<div class="flex gap-2">
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 256 256"><path fill="#00A6D6" d="M200 152a31.84 31.84 0 0 0-19.53 6.68l-23.11-18A31.65 31.65 0 0 0 160 128c0-.74 0-1.48-.08-2.21l13.23-4.41A32 32 0 1 0 168 104c0 .74 0 1.48.08 2.21l-13.23 4.41A32 32 0 0 0 128 96a32.6 32.6 0 0 0-5.27.44L115.89 81A32 32 0 1 0 96 88a32.6 32.6 0 0 0 5.27-.44l6.84 15.4a31.92 31.92 0 0 0-8.57 39.64l-25.71 22.84a32.06 32.06 0 1 0 10.63 12l25.71-22.84a31.91 31.91 0 0 0 37.36-1.24l23.11 18A31.65 31.65 0 0 0 168 184a32 32 0 1 0 32-32m0-64a16 16 0 1 1-16 16a16 16 0 0 1 16-16M80 56a16 16 0 1 1 16 16a16 16 0 0 1-16-16M56 208a16 16 0 1 1 16-16a16 16 0 0 1-16 16m56-80a16 16 0 1 1 16 16a16 16 0 0 1-16-16m88 72a16 16 0 1 1 16-16a16 16 0 0 1-16 16"/></svg>	</div>
</div><div/>`
	}

	const isBrowser = typeof window !== 'undefined';

	let edges: Edge[] = [];
	let cy: any;
	let selected: boolean = false;
	let selectedId: string = '';
	let prereqActive: boolean = false;
	let nodeClicked: boolean = false;
	let numSelected: number = 0;
	// let nodeHovered: boolean = false
	// let hoveredPublication : Publication & {
	// 	tags: { content: string }[]
	// };

	let mappedNodes = nodes.map(node => ({
		data: { id: node.publicationId.toString(), label: node.publication.title,
	},
		position: { x: node.posX, y: node.posY }
	}));

	nodes.forEach(node => {
		let curNext = node.next.map(nextNode =>
			({


				data: {
					id: String(node.publicationId).concat(String(nextNode.toPublicationId)),
					source: String(node.publicationId),
					target: String(nextNode.toPublicationId)
				}
			}));
		edges.push(...curNext);
	});

	onMount(async () => {
		// let cytoscapeHTML
		// if (isBrowser)
		// {
		// 	cytoscapeHTML = await import('cytoscape-html').then(module => module.default);
		// }
		// if(cytoscapeHTML)
		// {
		// 	cytoscape.use(cytoscapeHTML);
		// }


		// Initialize Cytoscape
		cy = cytoscape({
			container: document.getElementById('cy'),
			elements: [
				...mappedNodes,
				...edges
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
				// {
				// 	selector: 'node:active',
				// 	style: {
				// 		'width': '100px',
				// 		'height': '60px',
				// 		'shape': 'round-rectangle',
				// 		'background-color': '#F9F9FA',
				// 		'border-width' : '1px',
				// 		'border-color' : '#0088AD',
				// 		'color': '#4C4C5C',
				// 		'font-size': '10px',
				// 		'text-valign': 'center',
				// 		'text-halign': 'center',
				// 		'label': 'data(label)',
				// 	},
				// },
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


		cy.nodeHtmlLabel([
			{
				query: 'node',
				tpl: function(data : any) {
					return `<div class="node-content">
                      <button class="node-title bg-surface-600" use:popup="{popupHoverPub}" onclick='() => {alert("Haha")}'>${data.label}</button>
                      <div class="node-icons flex gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path d="M2 3h8a2 2 0 0 1 2-2a2 2 0 0 1 2 2h8v2h-1v11h-5.75L17 22h-2l-1.75-6h-2.5L9 22H7l1.75-6H3V5H2zm3 2v9h14V5z"/></svg>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path d="M2 3h8a2 2 0 0 1 2-2a2 2 0 0 1 2 2h8v2h-1v11h-5.75L17 22h-2l-1.75-6h-2.5L9 22H7l1.75-6H3V5H2zm3 2v9h14V5z"/></svg>
                      </div>
                    </div>`;
				}
			}
		]);

		cy.on('select', 'node', (event: any) => {

			numSelected++;
			let node = event.target;
			if (!publishing) {
				cy.$(`#${node.id()}`).unselect();
			}
			node.style({
				'background-color': '#4C4C5C',
				'color': '#F9F9FA'
			});


			if (selected && prereqActive) {
				let edgeId = 'e'.concat(node.id().toString().concat(selectedId.toString()));
				if (cy.getElementById(edgeId).length > 0) {
					cy.remove(cy.$(`#${edgeId}`));
				} else {
					cy.add({
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
		cy.on('unselect', 'node', () => {
			numSelected--;
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
			if (publishing) {
				const nodeId = event.target.id();
				if (selectedId !== nodeId) {
					nodeClicked = true;
				}
			} else {

				let cur = nodes.find(node => node.publicationId === Number(event.target.id()));

				if (cur) {
					// Assuming cur is an object and you want to navigate to the publisherId
					const url = `/${cur.publication.publisherId}/${event.target.id()}`;
					window.open(url, '_blank'); // Open the URL in a new tab
				} else {
					console.error('No matching node found for publicationId:', event.target.id());
				}
			}
		});


		/**
		 * Same as the above but activated on tap for mobile
		 */
		cy.on('tap', 'node', (event: any) => {
			if (publishing) {
				const nodeId = event.target.id();
				if (selectedId !== nodeId) {
					nodeClicked = true;
				}
			} else {

				let cur = nodes.find(node => node.publicationId === Number(event.target.id()));
				if (cur) {
					// Assuming cur is an object and you want to navigate to the publisherId
					const url = `/${cur.publication.publisherId}/${event.target.id()}`;
					window.open(url, '_blank'); // Open the URL in a new tab
				} else {
					console.error('No matching node found for publicationId:', event.target.id());
				}
			}

		});

		/**
		 * The two methods below are used to simulate hover effect on a node
		 */
		cy.on('mouseover', 'node', (event: any) => {
			const node = event.target;
			if (!node.selected() && !prereqActive) {
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

		cy.fit();
		//cy.nodes().renderHTMLNodes({ hideOriginal: true });
	});


	let addActive: boolean = false;
	let displayedMaterials: any = [];
	let fileData : FetchedFileArray = []
	let pubIds: Set<number> = new Set();

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
					data: { id: data.material.publication.id, label: data.material.publication.title,},
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
		pubIds.delete(event.detail.id);
	};




	/**
	 * Removes all selected nodes
	 */
	const modal: ModalSettings = {
		type: 'confirm',
		// Data
		title: 'Please Confirm',
		body: 'Are you sure you wish to proceed?',
		// TRUE if confirm pressed, FALSE if cancel pressed
		response: (r: boolean) => {
			if (r) {
				cy.nodes().forEach((node: any) => {
					if (node.selected()) {
						cy.remove(cy.$(`#${node.id()}`));
						pubIds.delete(Number(node.id()));
						console.log(cy.nodes())
					}
				});
				selectedId = '';
				selected = false;
			}
		}
	};

	export const publishCircuit = () => {

	 	let result: NodeDiffActions;

		const add: ({ publicationId: number; x: number; y: number }[]) = [];
		const del: ({ publicationId: number }[]) = [];
		const edit: ({ publicationId: number; x: number; y: number }[]) = [];
		const next: { fromId: number; toId: number[] }[] = [];
	//
	 	cy.nodes().forEach((node: any) => {
			add.push(({ publicationId: node.id(), x: node.position().x, y: node.position().y }));
			del.push(({ publicationId: node.id() }));
			edit.push(({ publicationId: node.id(), x: node.position().x, y: node.position().y }));
			let toID: number[] = cy.edges().filter((edge: any) => edge.source().id() === node.id()).map((edge: any) => edge.target().id());
			next.push(({ fromId: node.id(), toId: toID }));
	 	})
			result = { add: add, delete: del, edit: edit, next: next };
			return result;

	}


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
        width: 100%;
        height: 600px;
        border: 1px solid black;
    }
</style>
<div class="flex-col mt-10 col-span-7">
	{#if publishing}
		<div class="flex justify justify-between">
			<div class="flex gap-2">
				{#if !selected}
					<button type="button" class="btn variant-filled" on:click={fetchElements}>Add</button>
				{/if}
				{#if selected}
					{#if (numSelected < 2)}
						{#if prereqActive}
							<button type="button" class="btn variant-filled bg-surface-600" on:click={savePrereq}>Save Changes
							</button>
						{:else}
							<button type="button" class="btn variant-filled bg-surface-600" on:click={addPrereq}>Select
								Prerequisites
							</button>
						{/if}
					{/if}
					<button type="button" class="btn variant-filled bg-error-400" on:click={() => {	modalStore.trigger(modal);}}>
						Remove From
						Circuit
					</button>
				{/if}
			</div>
		</div>
	{/if}


	<div class="mt-2 w-full" id="cy"></div>
</div>


{#if addActive}
	<div>
		<SearchElems bind:addActive={addActive} bind:selectedIds={pubIds} bind:materials={displayedMaterials}
								 bind:fileData={fileData}
								 on:selFurther={addNode} on:remFurther={removeNode} />
	</div>
{/if}
<button class="btn variant-filled">Click</button>


<div class="card p-4 variant-filled-secondary" data-popup="popupHoverPub">
	<p>Hover Content</p>
	<div class="arrow variant-filled-secondary" />
</div>





