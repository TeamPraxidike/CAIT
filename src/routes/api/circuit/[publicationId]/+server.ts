import {
	getCircuitByPublicationId,
	prisma,
	handleConnections,
	type NodeDiffActions,
	deleteCircuitByPublicationId,
	addNode,
	deleteNode,
	editNode,
	handleEdges,
	updateCircuitByPublicationId,
	type CircuitForm,
} from '$lib/database';

export async function GET({ params }) {
	// Authentication step
	// return 401 if user not authenticated

	const publicationId = parseInt(params.publicationId);

	if (isNaN(publicationId) || publicationId <= 0) {
		return new Response(
			JSON.stringify({ error: 'Bad Request - Invalid ID' }),
			{
				status: 400,
			},
		);
	}

	try {
		const circuit = await getCircuitByPublicationId(publicationId);
		if (!circuit) {
			return new Response(
				JSON.stringify({ error: 'Circuit Not Found' }),
				{
					status: 404,
				},
			);
		}
		return new Response(JSON.stringify(circuit), { status: 200 });
	} catch (error) {
		return new Response(JSON.stringify({ error: 'Server Error' }), {
			status: 500,
		});
	}
}

/**
 * Update circuit
 * @param request
 * @param params
 */
export async function PUT({ request, params }) {
	// Authentication step
	// return 401 if user not authenticated

	const body: CircuitForm & {
		circuitId: number;
	} = await request.json();
	const circuit: CircuitForm = body;
	const metaData = circuit.metaData;
	// const userId = circuit.userId;
	const nodeInfo: NodeDiffActions = circuit.nodeDiff;
	const tags = metaData.tags;
	const maintainers = metaData.maintainers;

	const publicationId = parseInt(params.publicationId);

	if (isNaN(publicationId) || publicationId <= 0) {
		return new Response(
			JSON.stringify({ error: 'Bad Request - Invalid ID' }),
			{
				status: 400,
			},
		);
	}

	try {
		const circuit = await prisma.$transaction(async (prismaTransaction) => {
			const body = await request.json();

			await handleConnections(
				tags,
				maintainers,
				body.circuitId,
				prismaTransaction,
			);

			// add nodes
			for (const node of nodeInfo.add) {
				await addNode(
					node.circuitId,
					node.publicationId,
					node.x,
					node.y,
					prismaTransaction,
				);
			}

			// delete nodes
			for (const node of nodeInfo.delete) {
				await deleteNode(node.nodeId, prismaTransaction);
			}

			// edit existing nodes
			for (const node of nodeInfo.edit) {
				await editNode(
					node.nodeId,
					node.publicationId,
					node.x,
					node.y,
					prismaTransaction,
				);
			}

			await handleEdges(nodeInfo.next);

			const circuit = await updateCircuitByPublicationId(
				publicationId,
				metaData,
				prismaTransaction,
			);
			if (!circuit) {
				return new Response(
					JSON.stringify({ error: 'Circuit Not Found' }),
					{
						status: 404,
					},
				);
			}

			return circuit;
		});

		const id = circuit.id;

		return new Response(JSON.stringify({ id }), { status: 200 });
	} catch (error) {
		return new Response(JSON.stringify({ error: 'Server Error' }), {
			status: 500,
		});
	}
}

export async function DELETE({ params }) {
	const id = parseInt(params.publicationId);
	if (isNaN(id) || id <= 0) {
		return new Response(
			JSON.stringify({
				error: 'Bad Delete Request - Invalid Circuit Id',
			}),
			{ status: 400 },
		);
	}
	try {
		const circuit = await getCircuitByPublicationId(id);
		if (!circuit) {
			return new Response(
				JSON.stringify({ error: 'Circuit Not Found' }),
				{
					status: 404,
				},
			);
		}
		await deleteCircuitByPublicationId(id);
		return new Response(JSON.stringify(circuit), { status: 200 });
	} catch (error) {
		return new Response(JSON.stringify({ error: 'Server Error' }), {
			status: 500,
		});
	}
}
