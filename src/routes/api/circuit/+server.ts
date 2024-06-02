import { getAllCircuits } from '$lib/database/circuit';
import {
	addNode,
	type CircuitForm,
	createCircuitPublication,
	handleConnections,
	handleEdges,
	type NodeDiffActions,
	prisma,
} from '$lib/database';
import { verifyAuth } from '$lib/database/auth';

export async function GET({ locals }) {
	const authError = await verifyAuth(locals);
	if (authError) return authError;

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
export async function POST({ request, locals }) {
	const authError = await verifyAuth(locals);
	if (authError) return authError;

	const body: CircuitForm = await request.json();
	const tags = body.metaData.tags;
	const maintainers = body.metaData.maintainers;
	const metaData = body.metaData;
	const userId = body.userId;
	const nodeInfo: NodeDiffActions = body.nodeDiff;

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

				await handleEdges(circuit.id, nodeInfo.next, prismaTransaction);

				return circuit;
			},
		);

		const id = createdCircuit.id;

		return new Response(JSON.stringify({ id }), { status: 200 });
	} catch (error) {
		console.error(error);
		return new Response(JSON.stringify({ error: 'Server Error' }), {
			status: 500,
		});
	}
}
