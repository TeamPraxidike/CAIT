<script lang="ts">
	import { onMount } from 'svelte';
	import cytoscape from 'cytoscape';
	import cytoscapePopper from 'cytoscape-popper';
	import { computePosition, flip, shift, limitShift } from '@floating-ui/dom';

	// Register the popper extension with the factory function
	function popperFactory(ref: any, content: any, opts: any) {
		// See https://floating-ui.com/docs/computePosition#options
		const popperOptions = {
			// Matching the default behaviour from Popper@2
			// https://floating-ui.com/docs/migration#configure-middleware
			middleware: [
				flip(),
				shift({ limiter: limitShift() })
			],
			...opts,
		};

		function update() {
			computePosition(ref, content, popperOptions).then(({ x, y }) => {
				Object.assign(content.style, {
					left: `${x}px`,
					top: `${y}px`,
					zIndex: '1000', // Ensure popper appears above other elements
				});
			});
		}
		update();
		return { update };
	}

	cytoscape.use(cytoscapePopper(popperFactory));
	let cy: any;

	onMount(() => {
		const elements = [
			{ data: { id: 'node1', label: 'Node 1' } },
			{ data: { id: 'node2', label: 'Node 2' } },
			{ data: { id: 'node3', label: 'Node 3' } },
			{ data: { source: 'node1', target: 'node2' } },
			{ data: { source: 'node2', target: 'node3' } },
			{ data: { source: 'node3', target: 'node1' } },
		];

		cy = cytoscape({
			container: document.getElementById('cy'),
			elements,
			style: [
				{
					selector: 'node',
					style: {
						content: 'data(label)',
					},
				},
				{
					selector: 'edge',
					style: {
						'curve-style': 'bezier',
						'target-arrow-shape': 'triangle',
					},
				},
			],
		});

		// Add poppers to each node
		cy.nodes().forEach((node: any) => {
			const popperInstance = node.popper({
				content: () => {
					const div = document.createElement('div');
					div.classList.add('popper-div');
					div.innerHTML = node.id();
					document.body.appendChild(div);
					return div;
				}
			});

			const update = () => {
				popperInstance.update();
			};

			node.on('position', update);
			cy.on('pan zoom resize', update);
		});
	});
</script>

<style>
    #cy {
        width: 100%;
        height: 600px;
        border: 1px solid black;
        position: relative;
    }

    /*.popper-div {*/
    /*    background: white;*/
    /*    border: 1px solid #ccc;*/
    /*    padding: 5px;*/
    /*    border-radius: 5px;*/
    /*    box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.2);*/
    /*}*/
</style>

<div id="cy"></div>
