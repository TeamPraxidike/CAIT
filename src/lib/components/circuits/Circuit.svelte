<script lang="ts">
	import { onMount } from 'svelte';
	import cytoscape from 'cytoscape';
	import SearchElems from '$lib/components/circuits/SearchElems.svelte';
	import type { ModalSettings } from '@skeletonlabs/skeleton';
	import { getModalStore } from '@skeletonlabs/skeleton';
	import {
		Difficulty,
		MaterialType,
		type Node as PrismaNode,
		type Publication,
		PublicationType,
		type User
	} from '@prisma/client';
	import nodeHtmlLabel from 'cytoscape-node-html-label';
	import NodeTemplate from '$lib/components/circuits/NodeTemplate.svelte';
	import { PublicationCard } from '$lib';
	import html2canvas from 'html2canvas';
	import type { NodeDiffActions } from '$lib/database';

	const mapGetTo: Map<number, Set<number>> = new Map();
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
							extensions : data.extensions,
							isMaterial : data.isMaterial,
							dummyNode: data.dummyNode,
						}
					});
					return container.outerHTML;
				}
			}
		]);
	}

	nodeHtmlLabel(cytoscape)
	const modalStore = getModalStore();

	type Edge = {
		data: {
			id: string,
			source: string,
			target: string
		}
	}


	export let liked : number[] = []
	export let saved : number[] = []
	export let publishing: boolean;


	export let nodes: (PrismaNode & {
		publication: Publication & {
			tags: { content: string }[],
			usedInCourse: { course: string }[],
			publisher: (User & {profilePicData: string})
			coverPicData: string,
		}
		next: {
			circuitId: number,
			fromPublicationId: number,
			toPublicationId: number
		}[]
	})[];

	let startY: number = 100;

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


	let edges: Edge[] = [];
	let cy: any;
	let selected: boolean = false;
	let selectedId: string = '';
	let prereqActive: boolean = false;
	let nodeClicked: boolean = false;
	let edgeSelected: boolean = false;
	let numSelected: number = 0;
	let selectedNodePrereqs: Set<number> = new Set();
	let dummyNodeClicked: boolean = false;
	let cursorInsideNode: boolean = false;
	let hoveredNodeId : number = -1;



	onMount(async () => {

		// Initialize Cytoscape
		cy = cytoscape({
			container: document.getElementById('cy'),
			elements: [
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

				{
					selector: 'edge:selected',
					style: {
						'line-color': '#00A6D6',
						'target-arrow-color': '#00A6D6'
					}
				}

			],
			layout: {
				name: 'preset'
			},

			minZoom: 0.5,
			maxZoom: 2,
		});



		addHtmlLabel("node", false);

		cy.on('select', 'edge', () => {
			if(publishing)
			{
				numSelected++;
				edgeSelected = true;
			}
		});

		cy.on('unselect', 'edge', () => {
			if(publishing){
				numSelected--;
				edgeSelected = false;
			}
		});



		cy.on('select', 'node', (event: any) => {
			numSelected++;
			let node = event.target;
			if (node.id() === 'edgeStart')
			{
				node.unselect();
				if (selectedId !== '')
				{
					dummyNodeClicked = false
					cy.$(`#${selectedId}`).select();
				}
				return;
			}
			if (!publishing) {
				node.unselect()
				return;
			}

			if (!publishing && !(node.id() === 'edgeStart')) {
				cy.$(`#${node.id()}`).unselect();
			}
			node.style({
				'background-color': '#4C4C5C',
				'color': '#F9F9FA'
			});

			addHtmlLabel(`#${node.id()}`, true);



			if (selected && prereqActive) {
				let edgeId = `en${selectedId.toString()}n${node.id()}`;
				if (cy.getElementById(edgeId).length > 0) {
					cy.remove(cy.$(`#${edgeId}`));
					selectedNodePrereqs.delete(Number(node.id()))
				} else {
					if (cy.getElementById(`en${node.id()}n${selectedId}`).length === 0) {
						cy.add({
							group: 'edges',
							data: { id: `${edgeId}`, source: `${selectedId}`, target: `${node.id()}` }
						});
						selectedNodePrereqs.add(Number(node.id()));

					} else {
						alert('The reverse edge already exists, adding this edge will create a loop');
					}

				}

				cy.$(`#${node.id()}`).unselect();
				selected = false;
				cy.$(`#${selectedId}`).select();
			} else {

				if (prereqActive) {
					cy.edges().forEach((edge: any) => {
						if (edge.source().id() === selectedId) {
							edge.source().style({
								'background-color': '#9E9EAE',
								'color': '#F9F9FA'
							});

							addHtmlLabel(`#${edge.target().id()}`, true);
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
		cy.on('unselect', 'node', (event:any) => {
			numSelected--;
			if (event.target.id() === 'edgeStart')
			{

				return;
			}
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
			if (!prereqActive && !dummyNodeClicked) {
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
			if (event.target.id() === 'edgeStart')
			{
				dummyNodeClicked = true;
				return;
			}
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
			if (event.target.id() === 'edgeStart')
			{
				return;
			}
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
		cy.on('mouseover', 'node',  (event: any) => {

			const node = event.target;

			if (event.target.id() === 'edgeStart')
			{
				return;
			}

			cursorInsideNode = true;
			hoveredNodeId = Number(node.id());

			if(!publishing)
			{
				setTimeout(() => {
					// Check if cursor is still inside the node
					makePopUp(cursorInsideNode, hoveredNodeId, node)
				}, 700);
			}
			else {
				if (cy.getElementById('edgeStart').length === 0){
					cy.add({
						group: 'nodes',
						data: { id: "edgeStart", label: "", extensions : [], isMaterial: true, dummyNode: true},
						position: { x: node.position().x, y: node.position().y + 50 },
						style: {
							'border-width': '0px',
							'width' : 10,
							'height' : 10,
							'shape' : 'ellipse',
						}
					});
					cy.add({
						group: 'edges',
						data: { id: `temp`, source: `${hoveredNodeId}`, target: `edgeStart` }
					});
				}



			}



			// if (!node.selected() && !prereqActive && !(node.id() === 'edgeStart')) {
			// 	node.style({
			// 		'background-color': '#4C4C5C',
			// 		'color': '#F9F9FA',
			// 	});
			// }

			if(prereqActive && !node.selected() && !(node.id() === 'edgeStart')){
				node.style({
					'background-color': '#9E9EAE',
					'color': '#F9F9FA'
				});
			}
		});



		cy.on('drag', 'node', (event : any) => {
			startY = 250;
			const nodeA = event.target;
			if (nodeA.id() === 'edgeStart')
			{
				return;
			}
			else{
				const positionA = nodeA.position();
				const nodeB = cy.getElementById('edgeStart');

				// Update the position of node 'b' to match node 'a'
				nodeB.position({
					x: positionA.x, // Adjust the offset as needed
					y: positionA.y + 50
				});
			}

		});

		cy.on('free', 'node', (event:any) => {
			const nodeA = event.target;
			if (nodeA.id() !== 'edgeStart')
			{
				return;
			}


			const positionA = nodeA.position();
			cy.nodes().forEach((node : {id : () => string, position : () => {x : number, y:number}}) => {
				if (node.id() !== 'edgeStart' && node.id() !== hoveredNodeId.toString())
				{
					const positionB = node.position();
					if (positionA.x >= positionB.x - 90 && positionA.x <= positionB.x + 90 && positionA.y >= positionB.y - 90 && positionA.y <= positionB.y + 90)
					{
						if (cy.getElementById(`en${hoveredNodeId}n${node.id()}`).length === 0) {
							if (cy.getElementById(`en${node.id()}n${hoveredNodeId}`).length === 0) {
								cy.add({
									group: 'edges',
									data: { id: `en${hoveredNodeId}n${node.id()}`, source: `${hoveredNodeId}`, target: `${node.id()}` }
								});
							} else {
								alert('The reverse edge already exists, adding this edge will create a loop');
							}
						}

					}
				}

			})
			cy.remove(cy.$('#edgeStart'));
		})


		cy.on('mouseout', 'node', (event: any) => {
			const node = event.target;

			if (event.target.id() === 'edgeStart')
			{
				removeDummyNode(event.position.x, event.position.y, hoveredNodeId.toString())
				return;
			}

			cursorInsideNode = false;
			const divToRemove = document.getElementById('PublicationCardDiv');
			if (divToRemove) {
				document.body.removeChild(divToRemove);
			}

			if (!node.selected() && !prereqActive && !(node.id() === 'edgeStart')) {
				node.style({
					'background-color': '#FCFCFD',
					'color': '#4C4C5C'
				});
			}
			else if (!node.selected() && !selectedNodePrereqs.has(Number(node.id())) && !(node.id() === 'edgeStart')) {
				node.style({
					'background-color': '#FCFCFD',
					'color': '#4C4C5C'
				});
			}
			removeDummyNode(event.position.x, event.position.y, 'edgeStart')

		});

		/**
		 * Locks all nodes if not in editing mode making it impossible to move them
		 */
		if (!publishing)
			cy.nodes().forEach((node: any) => {
					if (node)
						node.lock()
			});



		document.addEventListener('mousemove', removePopupDiv)
		document.addEventListener('keydown', (event:KeyboardEvent) => {
			if (event.key === 'Delete' || event.key === 'Backspace') {
				removeSelected();
			}
		})

		nodes.forEach(node => {
			cy.add({
				group: 'nodes',
				data: { id: node.publicationId, label: node.publication.title, extensions : node.extensions, isMaterial: node.publication.type === PublicationType.Material, dummyNode: false},
				position: { x: node.posX, y: node.posY}
			})
		})

		nodes.forEach(node => {
			node.next.forEach(nextNode => {
					cy.add({
						group: 'edges',
						data: { id: `en${node.publicationId}n${nextNode.toPublicationId.toString()}`, source: node.publicationId.toString(), target: nextNode.toPublicationId.toString() }
					})
				});
		});
		if(!publishing)
			cy.fit();

		});




	let addActive: boolean = false;
	let displayedMaterials: any = [];
	let pubIds: Set<number> = new Set();
	nodes.map(node => pubIds.add(node.publicationId));

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

		await fetch(`/api/publication/${pubId}`)
			.then(response => {
				if (!response.ok) {
					throw new Error('Network response was not ok');
				}
				return response.json();
			})
			.then(data => {
				let extensions = [];
				if (data.isMaterial) {
					extensions = data.publication.materials.files.map((f: { title: string; }) => getFileExtension(f.title));
				}
				console.log(data)
				cy.add({
					group: 'nodes',
					data: { id: data.publication.id, label: data.publication.title, extensions : extensions, isMaterial: data.isMaterial, dummyNode: false},
					position: { x: 100, y: startY }
				});
				nodes.push(
					{
						next: [],
						circuitId: 1,
						publicationId: pubId,
						extensions: extensions,
						posX: 100,
						posY: startY,
						publication: {
							id: pubId as number,
							title: data.publication.title as string,
							description:"",
							difficulty: Difficulty.easy,
							likes: 0,
							learningObjectives: ['1'],
							prerequisites: ['1'],
							createdAt: new Date(),
							updatedAt: new Date(),
							publisherId: '1',
							reports: 2,
							type: data.publication.type,
							savedByAllTime: ['1'],
							tags: [{content: 'haha'}],
							usedInCourse: [{ course: '1' }],
							publisher: data.publication.publisher,
							coverPicData: data.publication.coverPicData,
						}
					},
				)
				mapGetTo.set(pubId, new Set());
				startY += 110;
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
		nodes = nodes.filter(x=>x.publicationId !== event.detail.id)
	};




	/**
	 * Removes all selected nodes
	 */
	const modal: ModalSettings = {
		type: 'confirm',
		title: 'Please Confirm',
		body: 'Are you sure you wish to proceed?',
		// TRUE if confirm pressed, FALSE if cancel pressed
		response: (r: boolean) => {
			if (r) {
				removeSelected();
			}
		}
	};

	const removeSelected = () => {
		cy.nodes().forEach((node: any) => {
			if (node.selected()) {
				node.unselect()
				cy.remove(cy.$(`#${node.id()}`));
				pubIds.delete(Number(node.id()));
				numSelected--
				nodes = nodes.filter(x=>x.publicationId !== Number(node.id()))
			}
		});
		cy.edges().forEach((edge: any) => {
			if (edge.selected()) {
				cy.remove(cy.$(`#${edge.id()}`));
				edges.filter(x=>x.data.id !== edge.id())
				numSelected--;
			}
		});

		selectedId = '';
		selected = false;
		edgeSelected = false
		prereqActive = false;
	}

	export const publishCircuit =  async() => {

		let nodeDiffActions: NodeDiffActions;
		const numNodes = cy.nodes().length;
		const add: ({ publicationId: number; x: number; y: number }[]) = [];
		const del: ({ publicationId: number }[]) = [];
		const edit: ({ publicationId: number; x: number; y: number }[]) = [];
		const next: { fromId: number; toId: number[] }[] = [];
		//
		cy.nodes().forEach((node: any) => {
			add.push(({ publicationId: Number(node.id()), x: Number(node.position().x), y: Number(node.position().y) }));
			del.push(({ publicationId: Number(node.id()) }));
			edit.push(({ publicationId: Number(node.id()), x: Number(node.position().x), y: Number(node.position().y) }));

			let curNode = nodes.filter(x=>x.publicationId === Number(node.id()))[0]
			curNode.posY = Number(node.position().y);
			curNode.posX = Number(node.position().x);

			let toID: number[] = cy.edges().filter((edge: any) => edge.source().id() === node.id()).map((edge: any) => {
				const targetId = Number(edge.target().id());
				curNode.next.push({
					circuitId: 1,
					fromPublicationId: node.id(),
					toPublicationId: targetId,
				})
				return targetId;
			});
			next.push(({ fromId: Number(node.id()), toId: toID }));
		})
		nodeDiffActions = {numNodes, add, delete:del, edit, next };

		const cover = await captureScreenshot()
		const coverPic = {
			type: 'image/png',
			info: cover
		}
		return { nodeDiffActions, coverPic };

	}

		const makePopUp = (cursorInsideNode: boolean, hoveredNodeId: number, node:{id : () => string, data : () => {extensions:string[]}}) => {
			if (cursorInsideNode && hoveredNodeId === Number(node.id())) {
				const htmlElement = document.getElementById(node.id());
				if (htmlElement) {
					const divElement = document.createElement('div');
					let publication = nodes.find(n => n.publicationId === Number(node.id()));

					if (publication) {
						const coverPicData = publication.publication.coverPicData;
						const publicationCard = new PublicationCard({
							target: divElement,
							props: {
								publication: publication.publication,
								inCircuits: false,
								imgSrc: 'data:image;base64,' +  coverPicData,
								forArrow: true,
								extensions: node.data().extensions,
								publisher: publication.publication.publisher,
								liked: liked.includes(publication.publicationId),
								saved: saved.includes(publication.publicationId)
							}
						});
						publicationCard.$on('liked', likedToggled);
						publicationCard.$on('saved', savedToggled);


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
		}


	/**
	 * Highlights all prerequisites of the selected node and activates the ability to add edges
	 */
	const addPrereq = () => {
		cy.edges().forEach((edge: any) => {
			if (edge.source().id() === selectedId) {
				edge.target().style({
					'background-color': '#9E9EAE',
					'color': '#F9F9FA'
				});
				selectedNodePrereqs.add(Number(edge.target().id()));
				addHtmlLabel(`#${edge.target().id()}`, true);
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

	const likedToggled = (event: CustomEvent) => {

		const id = event.detail.id;
		if (liked.includes(id)) {
			liked = liked.filter((i) => i !== id);
		} else {
			liked.push(id);
		}
	};

	const savedToggled = (event: CustomEvent) => {
		const id = event.detail.id;
		if (saved.includes(id)) {
			saved = saved.filter((i) => i !== id);
		} else {
			saved.push(id);
		}
	};

	const removeDummyNode = (mouseX:number, mouseY:number, id:string) => {

		const edgeStartNode = cy.getElementById(id);
		if (edgeStartNode.length > 0) {
			const boundingBox = edgeStartNode.renderedBoundingBox();
			if (mouseX >= boundingBox.x1 && mouseX <= boundingBox.x2 &&
				mouseY >= boundingBox.y1 && mouseY <= boundingBox.y2) {
				return; // Mouse is still over edgeStart node, do not remove it
			}

		}
		cy.remove(cy.$('#edgeStart'));
	}



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
					<button type="button" class="btn variant-filled" on:click={fetchElements}>Insert Publications</button>
				{/if}
				{#if (selected || edgeSelected)}
					{#if (numSelected < 2 && selected)}
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
								 on:selFurther={addNode} on:remFurther={removeNode} bind:liked={liked} bind:saved={saved}/>
	</div>
{/if}





