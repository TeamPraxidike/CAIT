<script lang="ts">
	import { writable } from 'svelte/store';
	import {
		Background,
		Controls,
		MiniMap,
		SvelteFlow,
		useSvelteFlow,
		type Edge,
		type Node,
		type FitViewOptions, MarkerType
	} from '@xyflow/svelte';

	import '@xyflow/svelte/dist/style.css';
	import NodeTemplate from '$lib/components/circuits/components/NodeTemplate.svelte';
	import type {
		CircuitNode,
		DisplayedMaterials, FullMaterial, NodeInfo
	} from '$lib/components/circuits/methods/CircuitTypes';
	import { onMount } from 'svelte';
	import { PublicationType } from '@prisma/client';
	import Icon from '@iconify/svelte';
	import { getModalStore, Modal, type ModalComponent, type ModalSettings } from '@skeletonlabs/skeleton';
	import SearchElems from '$lib/components/circuits/components/SearchElems.svelte';
	import TextThingy from '$lib/components/circuits/components/TextThingy.svelte';
	import { fetchMaterials, fetchNode } from '$lib/components/circuits/methods/CircuitApiCalls';
	import { collisionDetection } from '$lib/components/circuits/methods/CircuitUtilMethods';

	const modalStore = getModalStore();
	let modalRegistryHelp: Record<string, ModalComponent> = {
		// Set a unique modal ID, then pass the component reference
		TextThingy: {
			ref: TextThingy,
		}
	};

	const { fitView } = useSvelteFlow();
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

	//set of variables needed to deal with selected nodes
	let selected = false
	let selectedId = ''

	onMount(async () => {
		dbNodes.forEach(node => {
			const remove = () => removeNode(node.publication.id)
			$nodes.push({
				id: node.publication.id.toString(),
				data: {
					id: node.publication.id,
					label: node.publication.title,
					extensions: node.extensions,
					isMaterial: node.publication.type === PublicationType.Material,
					dummyNode: false, selected:false,
					publisherId : node.publication.publisher.id,
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
				const id = `en${node.publicationId}n${nextNode.toPublicationId.toString()}`;
				if (!repEdges.includes(id)) {
					repEdges.push(id);
					$edges.push({
						id: id,
						source: node.publicationId.toString(),
						target: nextNode.toPublicationId.toString(),
						type:'smoothstep'
					});
				}
			});
		});

		$nodes = $nodes;
		$edges = $edges;
	});

	const fetchElements = async () => {
		const fetchedMaterials: DisplayedMaterials = await fetchMaterials()
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
				publisherId:-1,
				remove: remove
			},
			position: { x: 0, y: 0 },
			type: "custom"
		}
		$nodes.push(node);
		$nodes = $nodes
		placementAlgorithm(node, 0, 0)
		const options : FitViewOptions = {
			nodes: $nodes,
		}
		await fitView(options)

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
		selectedId = '';
		selected = false;
		pubIds.delete(pubId);
		$nodes = $nodes.filter(x=> x.id !== pubId.toString())
		dbNodes = dbNodes.filter(x=>x.publicationId !== pubId)
	}

	export const placementAlgorithm = (node : any, positionX : number, positionY:number) => {
		if ($nodes.length === 1) return

		$nodes.forEach((n: any) => {
			if (n.id !== node.id){
				const vector = collisionDetection(positionX, positionY, n.position.x, n.position.y);
				if(vector){
					const data = n.data;
					const removedEdges : {id: string, source: string, target: string} [] = []

					$edges.forEach((edge:any) => {
						removedEdges.push({ id: `en${edge.source().id()}n${edge.target().id()}`, source: `${edge.source().id()}`, target: `${edge.target().id()}` })
					})
					$nodes = $nodes.filter(x => x.id !== n.id)
					$nodes.push({
						id: n.id,
						data: data,
						position: {x: n.position.x + vector[0], y: n.position.y + vector[1]},
						type: "custom"
					});

					removedEdges.forEach((edge:any) => {

						if ($edges.filter(x => x.id === edge.id).length === 0)
						{
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
					<!--{#if (selected || edgeSelected)}-->
					<!--	<button type="button" class="btn text-surface-50 bg-error-500 dark:bg-error-500" on:click={() => {	modalStore.trigger(modal);}}>Remove From Circuit</button>-->
					<!--{:else}-->
						<button type="button" class="btn text-surface-50 bg-success-500 dark:bg-success-500" on:click={fetchElements}>Insert Publications</button>
					<!--{/if}-->

					<!--{#if (numSelected < 2)}-->
					<!--	{#if prereqActive}-->
					<!--		{#if stage1}-->
					<!--			<button type="button" class="btn text-surface-50 dark:bg-surface-600 bg-surface-600" on:click={savePrereq}>Cancel</button>-->
					<!--		{:else}-->
					<!--			<button type="button" class="btn text-surface-50 bg-surface-600 dark:bg-surface-600" on:click={savePrereq}>Save Changes</button>-->

					<!--		{/if}-->
					<!--	{:else}-->
					<!--		{#if nodes.length > 1}-->
					<!--			<button type="button" class=" relative btn text-surface-50 bg-surface-600 dark:bg-surface-600" on:click={addPrereq}>Connect Publications</button>-->
					<!--		{/if}-->

					<!--	{/if}-->
					<!--{/if}-->


				</div>
			</div>
			<div class="flex gap-4">
<!--				<button type="button" class="btn text-surface-50 bg-surface-600 dark:bg-surface-600" on:click="{() => {cy.center()}}"> Recentre </button>-->
				<button type="button" on:click={() => {modalStore.trigger(modalHelp)}} class=" size-8 bg-surface-50 dark:bg-transparent rounded-full h-full self-center">
					<Icon icon="heroicons:question-mark-circle" class="size-8 text-surface-600 self-center dark:text-surface"/>
				</button>
			</div>
		</div>
	{/if}


	<div class="mt-2 w-full dark:border-surface-50" id="cy"></div>
</div>

<div style:height="100vh">
	<SvelteFlow {nodes} {edges} {nodeTypes} {defaultEdgeOptions} fitView nodesDraggable="{publishing}" nodesConnectable="{publishing}" elementsSelectable="{publishing}">
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

<!--{#if popupPrereq1}-->
<!--	<div class="fixed bottom-[8%] left-1/2 right-1/2 whitespace-nowrap  z-999 flex items-center justify-center" transition:fly={{ duration: 750 }} ><span class=" bg-surface-50 py-2 px-4 shadow-lg text-primary-600 rounded-full">Click on a publication to select the source</span></div>-->
<!--{/if}-->

<!--{#if popupPrereq2}-->
<!--	<div class="fixed bottom-[8%] left-1/2 right-1/2 whitespace-nowrap  z-999 flex items-center justify-center" transition:fly={{ duration: 750 }} ><span class=" bg-surface-50 py-2 px-4 shadow-lg text-primary-600 rounded-full">Click on a publication to add/remove edges from the source</span></div>-->
<!--{/if}-->


<Modal components={modalRegistryHelp}/>