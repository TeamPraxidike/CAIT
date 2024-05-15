import {
    getCircuitByPublicationId, prisma, handleConnections
} from "$lib/database";
import {updateCircuitByPublicationId} from "$lib/database/circuit";
import {addNode, deleteNode, editNode} from "$lib/database/node";

export async function GET({ params }) {
    // Authentication step
    // return 401 if user not authenticated

    const publicationId = parseInt(params.publicationId);

    if (isNaN(publicationId) || publicationId <= 0) {
        return new Response(
            JSON.stringify(
                { error: "Bad Request - Invalid ID" }
            ), { status: 400 });
    }

    try {
        const circuit = await getCircuitByPublicationId(publicationId);
        if (!circuit) {
            return new Response(
                JSON.stringify({ error: "Circuit Not Found"}
                ), { status: 404 });
        }
        return new Response(JSON.stringify(circuit), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: "Server Error" }), { status: 500 });
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

    const publicationId = parseInt(params.publicationId);

    if (isNaN(publicationId) || publicationId <= 0) {
        return new Response(JSON.stringify({ error: 'Bad Request - Invalid ID' }), {
            status: 400,
        });
    }

    try {
        const circuit = await prisma.$transaction(async (prismaTransaction) => {
            await handleConnections(request, publicationId, prismaTransaction);

            const body = await request.json();

            // add nodes
            for (const node of body.nodes.add) {
                await addNode(node.title, node.info, body.materialId, prismaTransaction);
            }

            // delete nodes
            for (const node of body.nodes.delete) {
                await deleteNode(node.path, prismaTransaction);
            }

            // edit existing nodes
            for (const node of body.nodes.edit) {
                await editNode(node.path, node.title, node.info, prismaTransaction);
            }

            const circuit = await updateCircuitByPublicationId(
                publicationId, body.title, body.description,
                body.difficulty, body.learningObjectives,
                body.prerequisites, prismaTransaction
            );
            if (!circuit) {
                return new Response(JSON.stringify({error: 'Circuit Not Found'}), {
                    status: 404,
                });
            }

            return circuit;
        });

        return new Response(JSON.stringify({ circuit }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Server Error' }), {
            status: 500,
        });
    }
}