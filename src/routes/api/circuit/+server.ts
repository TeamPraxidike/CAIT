import {
	getAllCircuits
} from '$lib/database/circuit';
import {
	addNode,
	type CircuitPostForm,
	createCircuitPublication,
	handleConnections,
	handleEdges,
	type NodeDiffActions, type NodePostActions,
	prisma,
} from '$lib/database';

export async function GET() {
	// Authentication step
	// return 401 if user not authenticated

	try {
		const circuits = await getAllCircuits();
		return new Response(JSON.stringify(circuits), { status: 200 });
	} catch (error) {
		return new Response(JSON.stringify({ error: 'Server Error' }), {
			status: 500,
		});
	}
}

/**
 * Create publication of type circuit
 * @param request
 * @param params
 */
export async function POST({ request }) {
	// Authentication step
	// return 401 if user not authenticated
	// TODO: Add 400 Bad request check

	const body: CircuitPostForm = await request.json();
	const tags = body.metaData.tags;
	const maintainers = body.metaData.maintainers;
	const metaData = body.metaData;
	const userId = body.userId;
	const nodeInfo: NodePostActions = body.nodeDiff;

	try {
		const createdCircuit = await prisma.$transaction(
			async (prismaTransaction) => {
				const circuit = await createCircuitPublication(
					userId,
					metaData,
					prismaTransaction,
				);

				await handleConnections(
					tags,
					maintainers,
					circuit.publicationId,
					prismaTransaction,
				);

				// add nodes
				for (const node of nodeInfo.add) {
					await addNode(
						circuit.id,
						node.publicationId,
						node.x,
						node.y,
						prismaTransaction,
					);
				}

				await handleEdges(circuit.id, nodeInfo.next);

				return circuit;
			},
		);

		const id = createdCircuit.id;

		return new Response(JSON.stringify({ id }), { status: 200 });
	} catch (error) {
		return new Response(JSON.stringify({ error: 'Server Error' }), {
			status: 500,
		});
	}
}
