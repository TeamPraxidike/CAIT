<script lang="ts">
</script>
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Cytoscape.js Graph with HTML Labels</title>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/cytoscape/3.21.1/cytoscape.min.js"></script>
	<script src="https://cdn.jsdelivr.net/npm/cytoscape-node-html-label@1.2.0/dist/cytoscape-node-html-label.js"></script>
	<style>
      #cy {
          width: 800px;
          height: 600px;
          border: 1px solid black;
      }
      .node-content {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: center;
          width: 90px; /* Adjusted width */
          height: 90px; /* Adjusted height */
          text-align: center;
          background-color: #666;
          color: white;
          border-radius: 5px; /* Adjusted border radius */
          padding: 5px; /* Added padding */
          box-sizing: border-box;
          overflow: hidden;
      }

      .node-content:hover{
          background-color: #770000;
          color: white;
      }
      .node-title {
          font-size: 14px;
          font-weight: bold;
      }
      .node-icons {
          display: flex;
          justify-content: center;
      }
      .node-icons svg {
          width: 15px;
          height: 15px;
          margin: 0 2px; /* Adjusted margin */
          fill: #7ee787;

      }
	</style>
</head>
<body>
<div id="cy"></div>
<script lang="ts">
	document.addEventListener("DOMContentLoaded", function () {
		// Initialize Cytoscape
		const cy = cytoscape({
			container: document.getElementById('cy'),
			elements: [
				{ data: { id: 'a' } },
				{ data: { id: 'b' } },
				{ data: { id: 'c' } },
				{ data: { id: 'd' } },
				{ data: { id: 'e' } },
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
						'height': '100px',
						'shape': 'rectangle',
						'background-color': '#666',
						'color': '#fff',
						'font-size': '12px',
						'text-valign': 'center',
						'text-halign': 'center',
						'label': 'data(id)',
					},
				},
				{
					selector: 'edge',
					style: {
						'width': 2,
						'line-color': '#ccc',
						'target-arrow-color': '#ccc',
						'target-arrow-shape': 'triangle',
					},
				},
			],
			layout: {
				name: 'grid',
			},
		});

		// Apply HTML labels to nodes
		cy.nodeHtmlLabel([
			{
				query: 'node',
				tpl: function(data) {
					return `<div class="node-content">
                      <div class="node-title">${data.id}</div>
                      <div class="node-icons">
                        <svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 24 24"><path d="M2 3h8a2 2 0 0 1 2-2a2 2 0 0 1 2 2h8v2h-1v11h-5.75L17 22h-2l-1.75-6h-2.5L9 22H7l1.75-6H3V5H2zm3 2v9h14V5z"/></svg>
                        <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24"><path d="M2 3h8a2 2 0 0 1 2-2a2 2 0 0 1 2 2h8v2h-1v11h-5.75L17 22h-2l-1.75-6h-2.5L9 22H7l1.75-6H3V5H2zm3 2v9h14V5z"/></svg>
                        <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24"><path d="M2 3h8a2 2 0 0 1 2-2a2 2 0 0 1 2 2h8v2h-1v11h-5.75L17 22h-2l-1.75-6h-2.5L9 22H7l1.75-6H3V5H2zm3 2v9h14V5z"/></svg>
                      </div>
                    </div>`;
				}
			}
		]);

		cy.on('click', 'node', (event) => {
			alert("node clicked" + event.target.id())
		})
	});
</script>
</body>
</html>