import {getAllCircuits, getCircuitByPublicationId} from '$lib/database/circuit';
import type { RequestHandler } from '@sveltejs/kit';
import {addNode, createCircuitPublication, handleConnections, handleEdges, type NodeInfo, prisma} from "$lib/database";

export async function GET( ) {
	// Authentication step
	// return 401 if user not authenticated

    try {
        const circuits = await getAllCircuits();
        return new Response(JSON.stringify(circuits), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: "Server Error" }), { status: 500 });
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
    try {
        const createdCircuit = await prisma.$transaction(async (prismaTransaction) => {

            const body = await request.json();

            const circuit = await createCircuitPublication(
                body.title, body.description,
                body.difficulty, body.learningObjectives,
                body.prerequisites, prismaTransaction
            );
            if (!circuit) {
                return new Response(JSON.stringify({error: 'Bad request'}), {
                    status: 400,
                });
            }

            await handleConnections(request, circuit.publicationId, prismaTransaction);

            const nodeInfo: NodeInfo = body.NodeInfo;

            // add nodes
            for (const node of nodeInfo.add) {
                await addNode(node.circuitId, node.publicationId, prismaTransaction);
            }

            await handleEdges(nodeInfo.next);

            return circuit;
        });

        const actualCircuit = getCircuitByPublicationId(createdCircuit.publicationId);

        return new Response(JSON.stringify({ actualCircuit }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Server Error' }), {
            status: 500,
        });
    }
}

