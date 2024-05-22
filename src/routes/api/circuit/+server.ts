import {
	getAllCircuits,
	getCircuitByPublicationId,
} from '$lib/database/circuit';
import type { RequestHandler } from '@sveltejs/kit';
import {
	addNode,
	type CircuitForm,
	createCircuitPublication,
	handleConnections,
	handleEdges,
	type NodeDiffActions,
	prisma,
} from '$lib/database';
import { create } from 'node:domain';

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
				if (!circuit) {
					return new Response(
						JSON.stringify({ error: 'Bad request' }),
						{
							status: 400,
						},
					);
				}

				await handleConnections(
					tags,
					maintainers,
					circuit.publicationId,
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

				await handleEdges(nodeInfo.next);

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
