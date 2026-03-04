<script lang="ts">
	import { writable } from 'svelte/store';
	import {
		Background,
		Controls,
		SvelteFlow,
		useSvelteFlow,
		type Edge,
		type Node,
		MarkerType,
	} from '@xyflow/svelte';

	import '@xyflow/svelte/dist/style.css';
	import NodeTemplate from '$lib/components/circuits/components/NodeTemplate.svelte';
	import type {
		DisplayedMaterials, FullMaterial, NodeInfo
	} from '$lib/components/circuits/methods/CircuitTypes';
	import { onMount } from 'svelte';
	import { getModalStore, Modal, type ModalComponent, type ModalSettings } from '@skeletonlabs/skeleton';
	import SearchElems from '$lib/components/circuits/components/SearchElems.svelte';
	import TextThingy from '$lib/components/circuits/components/TextThingy.svelte';
	import { fetchMaterials, fetchNode } from '$lib/components/circuits/methods/CircuitApiCalls';
	import { captureScreenshot, collisionDetection } from '$lib/components/circuits/methods/CircuitUtilMethods';
	import type { NodeDiffActions } from '$lib/database';
	import DeletableEdge from '$lib/components/circuits/components/DeletableEdge.svelte';

	const modalStore = getModalStore();
	let modalRegistryHelp: Record<string, ModalComponent> = {
		// Set a unique modal ID, then pass the component reference
		TextThingy: {
			ref: TextThingy,
		}
	};

	const instance = useSvelteFlow();
	const modalHelp: ModalSettings = {
		type: 'component',
		title: 'Instructions for Creating a Circuit',
		component: 'TextThingy',
		buttonTextCancel: "Close",
	};

	const modalAlert: ModalSettings = {
		type: 'alert',
		title: 'Loop Detected',
		body: 'You cannot add this edge because it will create a loop! Please reconsider your circuit design.',
		buttonTextCancel: "Got it",
	};


	function loopDetected(
		edges: Edge[],
		newEdge: { source: string; target: string }
	): boolean {
		const adjacency: Record<string, string[]> = {};

		// Build adjacency list from existing edges
		edges.forEach((edge) => {
			adjacency[edge.source] = adjacency[edge.source] ?? [];
			adjacency[edge.source].push(edge.target);
		});

		// Check if `newEdge` creates a cycle
		const { source, target } = newEdge;
		const visited = new Set<string>();
		const queue = [target];

		while (queue.length > 0) {
			const current = queue.shift()!;
			if (current === source) {
				return true; // Loop detected
			}
			if (!visited.has(current)) {
				visited.add(current);
				const neighbors = adjacency[current] || [];
				neighbors.forEach((n) => {
					if (!visited.has(n)) {
						queue.push(n);
					}
				});
			}
		}

		return false;
	}


	function handleEdgeCreate(connection) {
		const newEdge = { id: `e${connection.source}-${connection.target}`, ...connection };

		if (loopDetected($edges, newEdge)) {
			modalStore.trigger(modalAlert);
			return null;
		}

		return newEdge;
	}

	let currentFlow : SvelteFlow
	export let liked: number[] = [];
	export let saved: number[] = [];
	export let publishing: boolean;
	export let dbNodes: NodeInfo[];
	export const nodes = writable<Node[]>([]);
	export const edges = writable<Edge[]>([]);
	const nodeTypes = {
		'custom': NodeTemplate
	};

	const edgeTypes = {
		buttonedge: DeletableEdge
	};

	const defaultEdgeOptions = {
		style: 'stroke: #00A6D6;',
		type: 'smoothstep',
		markerEnd: {
			type: MarkerType.ArrowClosed,
			color: '#00A6D6'
		}
	};

	//Set of variables needed for the add menu
	let addActive = false
	let displayedMaterials: FullMaterial[] = [];
	let displayIds : number[] = []
	let pubIds: Set<number> = new Set();

	let store;

	onMount(async () => {
		store = currentFlow?.store;

		dbNodes.forEach(node => {
			const remove = () => removeNode(node.id)
			$nodes.push({
				id: node.id.toString(),
				data: {
					id: node.id,
					label: node.title,
					extensions: node.extensions,
					isMaterial: node.isMaterial,
					dummyNode: false, selected:false,
					username : node.username,
					publishing:publishing,
					remove:remove
				},
				position: { x: node.posX, y: node.posY },
				type: "custom"
			});
		});

		let repEdges: string[] = [];
		dbNodes.forEach(node => {
			node.next.forEach(nextNode => {
				const id = `en${node.id}n${nextNode.toPublicationId.toString()}`;
				if (!repEdges.includes(id)) {
					repEdges.push(id);
					$edges.push({
						id: id,
						source: node.id.toString(),
						target: nextNode.toPublicationId.toString(),
						type:'smoothstep'
					});
				}
			});
		});

		$nodes = $nodes;
		$edges = $edges;

		nodes.subscribe(_ => {
			convertNodesAndEdges()
		})

		edges.subscribe(newEdges => {
			convertNodesAndEdges()
			if (publishing){
				if (newEdges.filter(x => x.type !== "buttonedge").length > 0)
				{
					$edges = newEdges.map(x => {
						x.type = "buttonedge"
						return x
					})
				}
			}
		})
	});

	const convertNodesAndEdges = () => {
		dbNodes = $nodes.map(x => ({
			id: Number(x.data.id),
			title: String(x.data.label),
			extensions: x.data.extensions as string[],
			isMaterial: Boolean(x.data.isMaterial),
			username: String(x.data.username),
			posX: x.position.x,
			posY: x.position.y,
			next: [] as {circuitId: number,
				fromPublicationId: number,
				toPublicationId: number}[]
		}))
		$edges.forEach(x => {
			const source = dbNodes.find(y => y.id === Number(x.source))
			source?.next.push({
				circuitId: -1,
				toPublicationId: Number(x.target),
				fromPublicationId: Number(x.source)
			})
		})
	}

	export const publishCircuit =  async() => {

		let nodeDiffActions: NodeDiffActions;
		const numNodes = $nodes.length;
		const add: ({ publicationId: number; x: number; y: number }[]) = [];
		const del: ({ publicationId: number }[]) = [];
		const edit: ({ publicationId: number; x: number; y: number }[]) = [];
		const next: { fromId: number; toId: number[] }[] = [];
		//
		$nodes.forEach(node => {
			add.push(({ publicationId: Number(node.id), x: Number(node.position.x), y: Number(node.position.y) }));
			del.push(({ publicationId: Number(node.id) }));
			edit.push(({ publicationId: Number(node.id), x: Number(node.position.x), y: Number(node.position.y) }));

			let curNode = dbNodes.filter(x=>x.id === Number(node.id))[0]
			curNode.posY = Number(node.position.y);
			curNode.posX = Number(node.position.x);

			curNode.next = [];
			let toID: number[] = $edges.filter(edge => edge.source === node.id).map(edge => {
				const targetId = Number(edge.target);
				curNode.next.push({
					circuitId: 1,
					fromPublicationId: Number(node.id),
					toPublicationId: targetId,
				})
				return targetId;
			});
			next.push(({ fromId: Number(node.id), toId: toID }));
		})


		nodeDiffActions = {numNodes, add, delete:del, edit, next };


		const cover = await captureScreenshot()
		const coverPic = {
			type: 'image/png',
			info: cover
		}
		return { nodeDiffActions, coverPic };
	}

	const fetchElements = async () => {
		console.log("ELEMENTS FETCHING");
		const fetchedMaterials: DisplayedMaterials = await fetchMaterials()
		console.log("Fetched materials: ", fetchedMaterials);
		displayedMaterials = fetchedMaterials.displayedMaterials
		displayIds = fetchedMaterials.displayedIds
		addActive = true
	}

	const addNode = async (event: CustomEvent) => {
		const pubId = event.detail.id;
		const nodeInfo : NodeInfo = await fetchNode(pubId)
		const remove = () => removeNode(nodeInfo.id)

		const node = {
			id: nodeInfo.id.toString(),
			data: {
				id : nodeInfo.id,
				label: nodeInfo.title,
				extensions: nodeInfo.extensions,
				isMaterial: nodeInfo.isMaterial,
				dummyNode: false,
				selected:false,
				publishing:publishing,
				username:nodeInfo.username,
				remove: remove
			},
			position: { x: 0, y: 0 },
			type: "custom"
		}
		$nodes.push(node);
		$nodes = $nodes
		placementAlgorithm(node, 0, 0)
		if (store) {
			// for instance, you can subscribe to fitViewOptions or call fitView()
			store.fitViewOptions.subscribe((options) => {
				store.fitView(options);
			});
		}
	}

	/**
	 * Removes a node through the browsing page
	 * @param event -> event activated from the browsing page
	 */
	const removeNodeFromBrowsing = (event: CustomEvent) => {
		const pubId = event.detail.id
		removeNode(pubId)
	};

	const removeNode = (pubId : number) => {
		pubIds.delete(pubId);
		$nodes = $nodes.filter(x=> x.id !== pubId.toString())
		dbNodes = dbNodes.filter(x=>x.id !== pubId)
		$edges = $edges.filter(x=> x.source !== pubId.toString() && x.target !== pubId.toString())
		$edges = $edges
	}

	const placeNodes = (e: CustomEvent<{targetNode: Node<Record<string, unknown>, string> | null, nodes: Node<Record<string, unknown>, string>[], event: MouseEvent | TouchEvent}>) => {
		if (e.detail.targetNode === null) return
		const x: number = e.detail.targetNode.position.x;
		const y: number = e.detail.targetNode.position.y;
		placementAlgorithm(e.detail.targetNode, x, y)
	}


	export const placementAlgorithm = (node: any, positionX: number, positionY: number) => {
		if ($nodes.length === 1) return

		$nodes.forEach((n: any) => {
			if (n.id !== node.id) {
				const vector = collisionDetection(positionX, positionY, n.position.x, n.position.y);
				if (vector) {
					const data = n.data;
					const removedEdges: { id: string, source: string, target: string } [] = []

					$edges.forEach((edge: any) => {
						removedEdges.push({
							id: `en${edge.source}n${edge.target}`,
							source: edge.source,
							target: edge.target
						})
					})
					$nodes = $nodes.filter(x => x.id !== n.id)
					$nodes.push({
						id: n.id,
						data: data,
						position: { x: n.position.x + vector[0], y: n.position.y + vector[1] },
						type: "custom"
					});

					removedEdges.forEach((edge: any) => {

						if ($edges.filter(x => x.id === edge.id).length === 0) {
							$edges.push({
								id: `${edge.id}`,
								source: `${edge.source}`,
								target: `${edge.target}`
							});
						}
					})
					$nodes = $nodes
					$edges = $edges
					placementAlgorithm(n, n.position.x + vector[0], n.position.y + vector[1])
				}
			}
		});
	}
</script>

<div class="flex-col mt-10 col-span-7">
	{#if publishing}
		<div class = "flex flex-col md:flex-row gap-2 justify-between">
			<div class="flex justify justify-between">
				<div class="flex flex-col md:flex-row gap-2 ">
					<button type="button" class="btn text-surface-50 bg-success-500 dark:bg-success-500" on:click={fetchElements}>Insert Publications</button>
				</div>
			</div>
<!--			<div class="flex gap-4">-->
<!--				<button type="button" on:click={() => {modalStore.trigger(modalHelp)}} class=" size-8 bg-surface-50 dark:bg-transparent rounded-full h-full self-center">-->
<!--					<Icon icon="heroicons:question-mark-circle" class="size-8 text-surface-600 self-center dark:text-surface"/>-->
<!--				</button>-->
<!--			</div>-->
		</div>
	{/if}

	<div class="mt-2 w-full dark:border-surface-50" id="cy"></div>
</div>

<div id="flow" style:height="100vh">
	<SvelteFlow bind:this="{currentFlow}"
				{nodes}
				{edges}
				{nodeTypes}
				{edgeTypes}
				{defaultEdgeOptions}
				nodesDraggable="{publishing}"
				nodesConnectable="{publishing}"
				elementsSelectable="{publishing}"
				on:nodedragstop={placeNodes}
				onedgecreate={handleEdgeCreate}
				fitView>
		<Controls showLock={publishing}/>
		<Background />
	</SvelteFlow>
</div>

{#if addActive}
	<div>
		<SearchElems bind:addActive={addActive} bind:selectedIds={pubIds} bind:source={displayIds} bind:materials={displayedMaterials}
					 on:selFurther={addNode} on:remFurther={removeNodeFromBrowsing} bind:liked={liked} bind:saved={saved}/>
	</div>
{/if}
<Modal components={modalRegistryHelp}/>