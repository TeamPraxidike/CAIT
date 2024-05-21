<script lang="ts">
	import { onMount } from 'svelte';
	import cytoscape from 'cytoscape';
	import type {Node} from '@prisma/client';
	//	import cytoscapeNodeHtmlLabel from 'cytoscape-node-html-label';


	//cytoscapeNodeHtmlLabel(cytoscape);

	interface Edge {
		id:string
		source:string
		target:string
	}

	//export let dbNodes : Node[];

	export let publishing: boolean;

	 let idNodes : Node[];
	 let edges : Edge[];
	 let cy;



	onMount(() => {
		// Initialize Cytoscape
		cy = cytoscape({
			container: document.getElementById('cy'),
			elements: [
				{ data: { id: 'a', label: "Presentation"}, position: { x: 0, y: 0 } },
				{ data: { id: 'b', label: "Video"}, position: { x: 1000, y: 700 } },
				{ data: { id: 'c', label: "Something Else" }, position: { x: 100, y: 200 } },
				{ data: { id: 'd', label: "Intro into artificial neural network" }, position: { x: 100, y: 400 } },
				{ data: { id: 'e', label: "Assignment" }, position: { x: 150, y: 200 } },
				{ data: { id: 'ab', source: 'a', target: 'b' } },
				{ data: { id: 'bc', source: 'b', target: 'c' } },
				{ data: { id: 'cd', source: 'c', target: 'd' } },
				{ data: { id: 'de', source: 'd', target: 'e' } },
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
			cy.nodes().forEach(node => {
					if (node)
						node.lock()
			});
	});
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

<div id="cy"></div>
