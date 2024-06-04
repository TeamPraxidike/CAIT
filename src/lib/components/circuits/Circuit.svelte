<script lang="ts">
	import { onMount } from 'svelte';
	import cytoscape from 'cytoscape';
	import SearchElems from '$lib/components/circuits/SearchElems.svelte';
	import type {  NodeDiffActions } from '$lib/database';
	import type { ModalSettings } from '@skeletonlabs/skeleton';
	import { getModalStore } from '@skeletonlabs/skeleton';
	import type { Node as PrismaNode, Publication } from '@prisma/client';
	import nodeHtmlLabel from 'cytoscape-node-html-label';
	import NodeTemplate from '$lib/components/circuits/NodeTemplate.svelte';
	import { PublicationCard } from '$lib';
	import html2canvas from 'html2canvas';

	async function captureScreenshot () : Promise<string> {
		const container = document.getElementById('cy');
		try{
			if (container) {
				const result = await html2canvas(container)
				const imgData = result.toDataURL('image/png');
				return imgData.split(",")[1];
			}
			return ''
		}
		catch(error)  {
				console.error('Error capturing screenshot:', error);
				return ""
			}
	}

	const getFileExtension = (filePath: string): string =>  {
		const index = filePath.lastIndexOf('.');
		return index !== -1 ? filePath.substring(index + 1) : '';
	}
	const addHtmlLabel = (selector:string, selected: boolean) => {
		cy.nodeHtmlLabel([
			{
				query: selector,
				tpl: function(data : any) {
					const container = document.createElement('div');
					container.id = data.id;

					new NodeTemplate({
						target: container,
						props: {
							data: data.label,
							selected: selected,
							extensions : data.extensions
						}
					});
					return container.outerHTML;
				}
			}
		]);
	}

	nodeHtmlLabel(cytoscape)
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
		publication: Publication & {
			tags: { content: string }[]
		}
		next: {
			circuitId: number,
			fromPublicationId: number,
			toPublicationId: number
		}[]
	})[];

	const removePopupDiv = (event: MouseEvent) => {
		let rect = document.getElementById('cy')?.getBoundingClientRect()

		let mouseX = event.clientX
		let mouseY = event.clientY

		if (rect) {
			if (mouseX < rect.left || mouseX > rect.right || mouseY < rect.top || mouseY > rect.bottom)
			{
				const divToRemove = document.getElementById('PublicationCardDiv');
				if(divToRemove)
				{
					const rectPopup = divToRemove?.getBoundingClientRect();
					if ( mouseX < rectPopup.left || mouseX > rectPopup.right || mouseY < rectPopup.top || mouseY > rectPopup.bottom) {
						document.body.removeChild(divToRemove);
					}
				}
			}
		}
	}

	//onDestroy(() => {document.removeEventListener('mousemove', removePopupDiv)})



	let edges: Edge[] = [];
	let cy: any;
	let selected: boolean = false;
	let selectedId: string = '';
	let prereqActive: boolean = false;
	let nodeClicked: boolean = false;
	let numSelected: number = 0;
	let selectedNodePrereqs: Set<number> = new Set();
	// const createBendPoints = (sourcePos: { posX: number; posY: number; publicationId: number; publication: { title: string } }, targetPos: { posX: number; posY: number; publicationId: number; publication: { title: string } }) =>{
	// 	const midY = (sourcePos.posY + targetPos.posY) / 2;
	//
	// 	return [
	// 		{ x: sourcePos.posX, y: midY },
	// 		{ x: targetPos.posX, y: midY },
	// 	];
	// }

	let mappedNodes = nodes.map(node => ({
		data: { id: node.publicationId.toString(), label: node.publication.title, extensions : node.extensions
	},
		position: { x: node.posX, y: node.posY }
	}));

	nodes.forEach(node => {
		let curNext = node.next.map(nextNode =>
			({
				data: {
					id: (node.publicationId.toString()).concat(nextNode.toPublicationId.toString()),
					source:node.publicationId.toString(),
					target:nextNode.toPublicationId.toString(),
				//	controlPoints: createBendPoints(node, nodes.find(node => node.publicationId === nextNode.toPublicationId)!)
				}
			}));
		edges.push(...curNext);
	});

	onMount(async () => {


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
						'width': '180px',
						'height': '100px',
						'shape': 'round-rectangle',
						'background-color': '#F9F9FA',
						'border-width' : '1px',
						'border-color' : '#0088AD',
						'color': '#4C4C5C',
						'font-size': '10px',
						'text-valign': 'center',
						'text-halign': 'center',
						// 'label': 'data(label)',
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

		addHtmlLabel("node", false);


		cy.on('select', 'node', (event: any) => {
			console.log('Selected: ' + event.target.data().label);
			numSelected++;
			let node = event.target;
			if (!publishing) {
				node.unselect()
				return;
			}

			if (!publishing) {
				cy.$(`#${node.id()}`).unselect();
			}
			node.style({
				'background-color': '#4C4C5C',
				'color': '#F9F9FA'
			});

			addHtmlLabel(`#${node.id()}`, true);



			if (selected && prereqActive) {
				let edgeId = 'e'.concat(node.id().toString().concat(selectedId.toString()));
				if (cy.getElementById(edgeId).length > 0) {
					cy.remove(cy.$(`#${edgeId}`));
					selectedNodePrereqs.delete(Number(node.id()))
				} else {
					cy.add({
						group: 'edges',
						data: { id: `${edgeId}`, source: `${node.id()}`, target: `${selectedId}` }
					});
					selectedNodePrereqs.add(Number(node.id()))
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

							addHtmlLabel(`#${edge.source().id()}`, true)
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

				addHtmlLabel(`#${n.id()}`, false);
			});


			if (!nodeClicked) {
				prereqActive = false;
			}
			if (!prereqActive) {
				selectedNodePrereqs = new Set()
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

		let cursorInsideNode: boolean = false;
		let hoveredNodeId : number = -1;
		/**
		 * The two methods below are used to simulate hover effect on a node
		 */
		cy.on('mouseover', 'node', async (event: any) => {
			const node = event.target;
			cursorInsideNode = true;
			hoveredNodeId = Number(node.id());
			if(!publishing)
			{
				setTimeout(() => {
					// Check if cursor is still inside the node
					if (cursorInsideNode && hoveredNodeId === Number(node.id())) {
						const htmlElement = document.getElementById(node.id());
						if (htmlElement) {
							const divElement = document.createElement('div');
							let publication = nodes.find(n => n.publicationId === Number(node.id()));

							if (publication) {
								new PublicationCard({
									target: divElement,
									props: {
										publication: publication.publication,
										inCircuits: false,
										imgSrc: 'data:image;base64,',
										forArrow: true,
										extensions: node.data().extensions,
										liked: true,
										saved: true
									}
								});
							}

							divElement.id = 'PublicationCardDiv';
							divElement.className = 'w-[300px]';
							divElement.style.position = 'fixed';
							divElement.style.transition = 'transform 0.5s';



							document.body.appendChild(divElement);

							divElement.style.left = `${htmlElement.getBoundingClientRect().left + htmlElement.getBoundingClientRect().width}px`;
							divElement.style.top = `${htmlElement.getBoundingClientRect().top + htmlElement.getBoundingClientRect().height / 2 - divElement.getBoundingClientRect().height / 2}px`;
						}

					}
				}, 700);
			}




			if (!node.selected() && !prereqActive) {
				console.log("Here")
				node.style({
					'background-color': '#4C4C5C',
					'color': '#F9F9FA',
					'border': '1px solid #F9F9FA'
				});
			}

			else if(!node.selected()){
				node.style({
					'background-color': '#9E9EAE',
					'color': '#F9F9FA'
				});
			}
		});


		cy.on('mouseout', 'node', (event: any) => {
			const node = event.target;
			cursorInsideNode = false;
			const divToRemove = document.getElementById('PublicationCardDiv');
			if (divToRemove) {
				document.body.removeChild(divToRemove);
			}

			if (!node.selected() && !prereqActive) {
				node.style({
					'background-color': '#FCFCFD',
					'color': '#4C4C5C'
				});
			}
			else if (!node.selected() && !selectedNodePrereqs.has(Number(node.id()))) {
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

		document.addEventListener('mousemove', removePopupDiv)
		// cy.edges().forEach((edge:any) => {
		// 		const controlPoints = edge.data('controlPoints');
		// 		if (controlPoints) {
		// 			edge.style({
		// 				'segment-distances': controlPoints.map((point: { x: number; y: number; }) => {
		// 					// Calculate the distance from the source to each control point
		// 					const srcPos = edge.source().position();
		// 					const dist = Math.sqrt(Math.pow(point.x - srcPos.x, 2) + Math.pow(point.y - srcPos.y, 2));
		// 					return dist;
		// 				}),
		// 				'segment-weights': controlPoints.map((_: any, index: number) => (index + 1) / (controlPoints.length + 1)),
		// 				'segment-endpoints': controlPoints
		// 			});
		// 		}
		// 	});



		});




	let addActive: boolean = false;
	let displayedMaterials: any = [];
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
				let extensions = data.material.files.map((f: { title: string; }) => getFileExtension(f.title));
				cy.add({
					group: 'nodes',
					data: { id: data.material.publication.id, label: data.material.publication.title, extensions : extensions},
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
						node.unselect()
						cy.remove(cy.$(`#${node.id()}`));
						pubIds.delete(Number(node.id()));
						numSelected--
					}
				});
				selectedId = '';
				selected = false;
				prereqActive = false;

			}
		}
	};

	export const publishCircuit = async () => {

		let nodeDiffActions: NodeDiffActions;

		const add: ({ publicationId: number; x: number; y: number }[]) = [];
		const del: ({ publicationId: number }[]) = [];
		const edit: ({ publicationId: number; x: number; y: number }[]) = [];
		const next: { fromId: number; toId: number[] }[] = [];
		//
		cy.nodes().forEach((node: any) => {
			add.push(({ publicationId: Number(node.id()), x: Number(node.position().x), y: Number(node.position().y) }));
			del.push(({ publicationId: Number(node.id()) }));
			edit.push(({ publicationId: Number(node.id()), x: Number(node.position().x), y: Number(node.position().y) }));
			let toID: number[] = cy.edges().filter((edge: any) => edge.source().id() === node.id()).map((edge: any) => Number(edge.target().id()));
			next.push(({ fromId: Number(node.id()), toId: toID }));
		})
		nodeDiffActions = { add: add, delete: del, edit: edit, next: next };

		// cy.fit();
		// addHtmlLabel("node", false)
		// generate a png, could also use cy.jpg
		// base64uri by default, using base64 for now
		//const cover = cy.png({output: 'base64'});
		const cover = await captureScreenshot()
		console.log("COVER")
		console.log(cover)
		const coverPic = {
			type: 'image/png',
			info: cover
		}
		return { nodeDiffActions, coverPic };

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
				selectedNodePrereqs.add(Number(edge.source().id()));
				addHtmlLabel(`#${edge.source().id()}`, true);
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
								 on:selFurther={addNode} on:remFurther={removeNode} />
	</div>
{/if}





